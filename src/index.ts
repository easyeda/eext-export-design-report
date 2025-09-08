import * as extensionConfig from '../extension.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {}

export function about(): void {
	eda.sys_MessageBox.showInformationMessage(
		eda.sys_I18n.text('EasyEDA Export Report Tool v', undefined, undefined, extensionConfig.version) + '\n' + extensionConfig.description,
		eda.sys_I18n.text('About'),
	);
}

// 生成网络名称＋长度的CSV文件
export async function extractAllNetDetails() {
	try {
		const allNetNames = await eda.pcb_Net.getAllNetName();
		const allNetDetails = await Promise.all(
			allNetNames.map(async (netName) => {
				const length = (await eda.pcb_Net.getNetLength(netName)) || 0;
				return { name: netName, length };
			}),
		);

		allNetDetails.sort((a, b) => a.name.localeCompare(b.name));

		const csvContent =
			`"Net","Net Length(mil)","Net Length(mm)"\n` +
			allNetDetails
				.map((detail) => {
					const lengthWithUnit = detail.length.toFixed(1) + ' mil';
					const lengthWithUnitmm = (detail.length * 0.0254).toFixed(3) + ' mm';
					return `"${detail.name}","${lengthWithUnit}","${lengthWithUnitmm}"`;
				})
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'AllNetLengthDetails.csv');
		console.log('CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to get net details or save file:', error);
	}
}

// 生成网络类，网络名称，长度的CSV文件
export async function extractNetClassLengthDetails() {
	try {
		// 获取所有网络类别
		const allNetClasses = await eda.pcb_Drc.getAllNetClasses();
		const allNetNames = await eda.pcb_Net.getAllNetName();
		const allNetDetails = await Promise.all(
			allNetNames.map(async (netName) => {
				const length = (await eda.pcb_Net.getNetLength(netName)) || 0;
				return { name: netName, length };
			}),
		);

		// 关联网络类别信息，过滤没有类别的网络
		const netDetailsWithClass = allNetDetails
			.map((detail) => {
				const netClass = allNetClasses.find((netClass) => netClass.nets.includes(detail.name));
				return netClass ? { ...detail, netClass: netClass.name } : null;
			})
			.filter((item) => item !== null);

		// 根据网络类别和网络长度对网络详细信息进行排序
		netDetailsWithClass.sort((a, b) => {
			if (a.netClass !== b.netClass) {
				return a.netClass.localeCompare(b.netClass); // 正序排列网络类别
			}
			return b.length - a.length; // 从长到短排列网络长度
		});

		const csvContent =
			`"Net Classes","Net","Net Length(mil)","Net Length(mm)"\n` +
			netDetailsWithClass
				.map((netDetail) => {
					return `"${netDetail.netClass}","${netDetail.name}","${netDetail.length.toFixed(1)} mil","${(netDetail.length * 0.0254).toFixed(3)} mm"`;
				})
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'NetClassLengthDetails.csv');
		console.log('CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to get net details or save file:', error);
	}
}

// 输出差分对名称
export async function extractDifferentialPairsDetails() {
	try {
		// 获取所有差分对
		const allDifferentialPairs = await eda.pcb_Drc.getAllDifferentialPairs();

		// 获取所有网络的详细信息
		const allNetDetails = await Promise.all(
			allDifferentialPairs.map(async (pair) => {
				const positiveLength = (await eda.pcb_Net.getNetLength(pair.positiveNet)) || 0;
				const negativeLength = (await eda.pcb_Net.getNetLength(pair.negativeNet)) || 0;
				return {
					pairName: pair.name,
					positiveNet: pair.positiveNet,
					positiveLength,
					negativeNet: pair.negativeNet,
					negativeLength,
				};
			}),
		);

		// 对数组先按差分对名称正序排序，再按网络长度从长到短排序
		allNetDetails.sort((a, b) => {
			if (a.pairName !== b.pairName) {
				return a.pairName.localeCompare(b.pairName);
			}
			if (a.positiveLength !== b.positiveLength) {
				return b.positiveLength - a.positiveLength;
			}
			return b.negativeLength - a.negativeLength;
		});

		const csvContent =
			`"Differential Pair","Net","Net Length(mil)","Net Length(mm)"\n` +
			allNetDetails
				.flatMap((netDetail) => [
					`"${netDetail.pairName}","${netDetail.positiveNet}","${netDetail.positiveLength.toFixed(1)} mil","${(netDetail.positiveLength * 0.0254).toFixed(3)} mm"`,
					`"${netDetail.pairName}","${netDetail.negativeNet}","${netDetail.negativeLength.toFixed(1)} mil","${(netDetail.negativeLength * 0.0254).toFixed(3)} mm"`,
				])
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'DifferentialPairLengthDetails.csv');
		console.log('CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to get net details or save file:', error);
	}
}

// 输出等长网络对组名称
export async function extractEqualLengthNetGroupsDetails() {
	try {
		// 获取等长网络组
		const equalLengthNetGroups = await eda.pcb_Drc.getAllEqualLengthNetGroups();

		// 获取所有网络的详细信息
		const allNetDetails = await Promise.all(
			equalLengthNetGroups.map(async (group) => {
				const netLengths = await Promise.all(
					group.nets.map(async (net) => {
						const netLength = (await eda.pcb_Net.getNetLength(net)) || 0;
						return {
							group: group.name,
							net,
							netLength,
						};
					}),
				);
				return netLengths;
			}),
		).then((results) => [].concat(...results)); // Flatten the array of arrays

		// 对数组先按等长网络组正序排序，再按网络长度从长到短排序
		allNetDetails.sort((a, b) => {
			if (a.group !== b.group) {
				return a.group.localeCompare(b.group);
			}
			return b.netLength - a.netLength;
		});

		const csvContent =
			`"Equal Length Group","Net","Net Length(mil)","Net Length(mm)"\n` +
			allNetDetails
				.map(
					(netDetail) =>
						`"${netDetail.group}","${netDetail.net}","${netDetail.netLength.toFixed(1)} mil","${(netDetail.netLength * 0.0254).toFixed(3)} mm"`,
				)
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'EqualLengthGroupLengthDetails.csv');
		console.log('CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to get net details or save file:', error);
	}
}

// 输出焊盘对组名称
export async function extractPadPairGroupsDetails() {
	try {
		// 获取所有焊盘对组
		const allPadPairGroups = await eda.pcb_Drc.getAllPadPairGroups();

		// 获取所有焊盘对的详细信息
		const allPadPairDetails = await Promise.all(
			allPadPairGroups.map(async (group) => {
				const padPairsLengths = await Promise.all(
					group.padPairs.map(async (padPair, index) => {
						const [pad1, pad2] = padPair;
						// 使用eda.pcb_Drc.getPadPairGroupMinWireLength()方法获取长度数组
						const lengths = await eda.pcb_Drc.getPadPairGroupMinWireLength(group.name);
						// 从返回的数组中提取minWireLength，并创建一个包含所有长度的对象
						// 假设lengths数组的长度与padPairs数组的长度相匹配
						const padPairLengths = lengths.map((item) => item.minWireLength);
						return {
							group: group.name,
							padPair: `${pad1} - ${pad2}`,
							lengths: padPairLengths.slice(index, index + 1), // 只取当前padPair对应的长度
						};
					}),
				);
				return padPairsLengths;
			}),
		).then((results) => [].concat(...results)); // Flatten the array of arrays

		// 对数组先按焊盘对组正序排序，再按焊盘对名称正序排序
		allPadPairDetails.sort((a, b) => {
			if (a.group !== b.group) {
				return a.group.localeCompare(b.group);
			}
			return a.padPair.localeCompare(b.padPair);
		});

		const csvContent =
			`"Pads Pair Group","Pads Pair","Net Lengths(mil)","Net Lengths(mm)"\n` +
			allPadPairDetails
				.map((padPairDetail) => {
					// 为每个焊盘对生成一行，包含所有长度值
					return padPairDetail.lengths
						.map((length) => {
							const lengthMil = length.toFixed(1);
							const lengthMm = (length * 0.0254).toFixed(3);
							return `"${padPairDetail.group}","${padPairDetail.padPair}","${lengthMil} mil","${lengthMm} mm"`;
						})
						.join('\n');
				})
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'PadPairNetGroupLengthDetails.csv');
		console.log('CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to get pad pair details:', error);
	}
}

export async function extractSelectPadDetails() {
	try {
		// 首先判断是否选中图元
		const selectedPrimitives = await eda.pcb_SelectControl.getAllSelectedPrimitives();
		console.log(selectedPrimitives);

		// 检查是否有选中的焊盘
		const selectedPads = selectedPrimitives.filter(primitive => primitive.primitiveType === 'Pad');

		if (selectedPads.length > 0) {
			// 有选中的焊盘，直接处理
			eda.sys_Message.showToastMessage(
				eda.sys_I18n.text('Detected ${1} selected pads, exporting coordinate information...', undefined, undefined, selectedPads.length),"info"
			);
			await processPadDetails(selectedPads);
		} else {
			// 没有选中焊盘，提示用户先选择焊盘
			eda.sys_Message.showToastMessage(
				eda.sys_I18n.text('Please select the pad on the canvas first'),"info"
			);
			console.log('No pads selected, please select pads first.');
		}
	} catch (error) {
		console.error('Failed to extract pad details:', error);
	}
}

// 处理焊盘详细信息的辅助函数
async function processPadDetails(pads) {
	try {
		// 使用默认单位mil
		const unitLabel = 'mil';

		const padDetails = await Promise.all(
			pads.map(async (pad) => {
				let componentDesignator = '';
				
				// 从primitiveId提取组件ID
				const primitiveId = pad.primitiveId;
				let componentId = '';
				
				// 处理primitiveId格式，如"e1e8"取"e1"，"ie1e8"取"e1"，"e5"保持"e5"
				if (primitiveId.startsWith('i')) {
					// 去掉开头的'i'
					const withoutI = primitiveId.substring(1);
					const match = withoutI.match(/^(e\d+)/);
					componentId = match ? match[1] : withoutI;
				} else {
					const match = primitiveId.match(/^(e\d+)/);
					componentId = match ? match[1] : primitiveId;
				}

				// 尝试获取组件信息
				try {
					const component = await eda.pcb_PrimitiveComponent.get(componentId);
					if (component && component.designator) {
						componentDesignator = component.designator;
					}
				} catch (componentError) {
					// 如果获取组件失败，可能是游离焊盘，componentDesignator保持为空
					console.log(`Component not found for pad ${primitiveId}, treating as free pad`);
				}

				return {
					component: componentDesignator,
					designator: pad.padNumber || '',
					x: pad.x,
					y: pad.y
				};
			})
		);

		// 生成CSV内容
		const csvContent = 
			`"Component","Designator","X1(${unitLabel})","Y1(${unitLabel})","X1(mm)","Y1(mm)"\n` +
			padDetails
				.map((detail) => {
					// 将mil转换为mm (1 mil = 0.0254 mm)
					const xMm = (detail.x * 0.0254).toFixed(3);
					const yMm = (detail.y * 0.0254).toFixed(3);
					return `"${detail.component}","${detail.designator}","${detail.x.toFixed(3)}","${detail.y.toFixed(3)}","${xMm}","${yMm}"`;
				})
				.join('\n');

		// 保存CSV文件
		await eda.sys_FileSystem.saveFile(new Blob([csvContent], { type: 'text/csv' }), 'PadCoordinateDetails.csv');
		eda.sys_Message.showToastMessage(
			eda.sys_I18n.text('Successfully exported ${1} pad coordinate information to ${2} file', undefined, undefined, padDetails.length, 'PadCoordinateDetails.csv'),"success"
		);
		console.log('Pad coordinates CSV file saved successfully.');
	} catch (error) {
		console.error('Failed to process pad details:', error);
	}
}
