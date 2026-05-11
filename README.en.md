# Export Equal Length Network Lengths

[中文](./README.md)

## Feature Overview

This extension is used to export the length information and pad coordinate information of specified high-speed networks based on the current PCB design. It supports exporting the following:

-   Nets
-   Net Classes
-   Differential Pairs
-   Equal Length Net Groups
-   Pad Pair Groups
-   Pad Coordinates

The export format is CSV files, with units including mil and mm.

The default sorting rule is: first sorted by net class name in ascending order, then sorted by net length from longest to shortest.

### File Content Examples

1. **Nets**

    ```
    Net,Net Length(mil),Net Length(mm)
    ```

2. **Net Classes**

    ```
    Net Classes,Net,Net Length(mil),Net Length(mm)
    ```

3. **Differential Pairs**

    ```
    Differential Pair,Net,Net Length(mil),Net Length(mm)
    ```

4. **Equal Length Net Groups**

    ```
    Equal Length Group,Net,Net Length(mil),Net Length(mm)
    ```

5. **Pad Pair Groups**
    ```
    Pads Pair Group,Pads Pair,Net Length(mil),Net Length(mm)
    ```

6. **Pad Coordinates**
    ```
    Component,Designator,X1(mil),Y1(mil),X1(mm),Y1(mm)
    ```

## User Interface

Users can access the following features through the top menu bar:

![alt text](images/PixPin_2025-09-03_15-08-04.png)

-   PCB Page > Report > Net Length > Nets
-   PCB Page > Report > Net Length > Net Classes
-   PCB Page > Report > Net Length > Differential Pairs
-   PCB Page > Report > Net Length > Equal Length Net Groups
-   PCB Page > Report > Net Length > Pad Pair Groups
-   PCB Page > Report > Pad Coordinates

## How to Use the Pad Coordinates Feature

Instructions for the pad coordinate export feature:

1. Select the pads whose coordinates you want to export on the PCB canvas
2. Click the menu: PCB Page > Report > Pad Coordinates
3. The system will automatically detect the selected pads and export the coordinate information

If no pads are selected, the system will prompt "Please select pads on the canvas first"
