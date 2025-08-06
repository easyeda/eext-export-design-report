# 导出等长网络长度

## 功能概述

本插件用于基于当前 PCB 设计，导出指定高速网络的长度信息。支持以下内容的导出：

-   网络
-   网络类
-   差分对
-   等长网络组
-   焊盘对组

导出格式为CSV文件，单位包括mil和mm。

默认排序规则为：首先按网络类名称正序排列，其次按网络长度从长到短排列。

### 文件内容示例

1. **网络**

    ```
    Net,Net Length(mil),Net Length(mm)
    ```

2. **网络类**

    ```
    Net Classes,Net,Net Length(mil),Net Length(mm)
    ```

3. **差分对**

    ```
    Differential Pair,Net,Net Length(mil),Net Length(mm)
    ```

4. **等长网络组**

    ```
    Equal Length Group,Net,Net Length(mil),Net Length(mm)
    ```

5. **焊盘对组**
    ```
    Pads Pair Group,Pads Pair,Net Length(mil),Net Length(mm)
    ```

## 操作界面

用户可以通过顶部菜单栏访问以下功能：

![图 0](images/946bf688b5a7d5a132129f227fdfcaf981a3beb8edb68907456873c52987ffe4.png)  

-   PCB页面 > 报告 > 网络长度 > 网络
-   PCB页面 > 报告 > 网络长度 > 网络类
-   PCB页面 > 报告 > 网络长度 > 差分对
-   PCB页面 > 报告 > 网络长度 > 等长网络组
-   PCB页面 > 报告 > 网络长度 > 焊盘对组

