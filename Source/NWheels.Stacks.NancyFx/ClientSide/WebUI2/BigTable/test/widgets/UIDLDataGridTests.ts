﻿///<reference path="../../lib/typings/jasmine/jasmine.d.ts" />

namespace UIDL.Widgets.Tests
{
    class TestDataGridBinding<T> extends DataGridBindingBase {
        private _data: T[];

        //-------------------------------------------------------------------------------------------------------------

        public constructor(data: T[]) {
            super();
            this._data = data.slice(0);
        }

        //-------------------------------------------------------------------------------------------------------------

        public renderRow(index: number, el: HTMLTableRowElement): void {
            el.cells[0].innerHTML = this.getRowDataAt(index).toString();
        }

        //-------------------------------------------------------------------------------------------------------------

        public getRowCount(): number {
            return this._data.length;
        }

        //-------------------------------------------------------------------------------------------------------------

        public getRowDataAt(index: number): Object {
            return this._data[index];
        }

        //-------------------------------------------------------------------------------------------------------------

        public getAllRowsData(): Object[] {
            return this._data;
        }

        //-------------------------------------------------------------------------------------------------------------

        public insertRows(atIndex: number, data: T[]) {
            let newData: T[] = [];

            for (let i = 0; i < atIndex; i++) {
                newData.push(this._data[i]);
            }
            for (let i = 0; i < data.length; i++) {
                newData.push(data[i]);
            }
            for (let i = atIndex; i < this._data.length; i++) {
                newData.push(this._data[i]);
            }

            this._data = newData;
            let args = new DataGridRowsChangedEventArgs(DataGridRowsChangeType.inserted, atIndex, data.length);
            this.changed().raise(args);
        }

        //-------------------------------------------------------------------------------------------------------------

        public updateRows(atIndex: number, data: T[]) {
            for (let i = 0; i < data.length; i++) {
                this._data[atIndex + i] = data[i];
            }

            let args = new DataGridRowsChangedEventArgs(DataGridRowsChangeType.updated, atIndex, data.length);
            this.changed().raise(args);
        }

        //-------------------------------------------------------------------------------------------------------------

        public deleteRows(atIndex: number, count: number) {
            this._data.splice(atIndex, count);

            let args = new DataGridRowsChangedEventArgs(DataGridRowsChangeType.deleted, atIndex, count);
            this.changed().raise(args);
        }
    }

    //-----------------------------------------------------------------------------------------------------------------

    describe("LocalDataGridBinding", () => {

        it("CanGetRowCount", () => {
            //- arrange

            let dataRows = ["AAA", "BBB", "CCC"];

            //- act

            let binding = new LocalDataGridBinding(dataRows);

            //- assert

            expect(binding.getRowCount()).toBe(3);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanGetRowAtIndex", () => {

            //- arrange

            let dataRows = ["AAA", "BBB", "CCC"];
            let binding = new LocalDataGridBinding(dataRows);

            //- act

            var rowReturned = binding.getRowDataAt(1);

            //- assert

            expect(rowReturned).toEqual("BBB");
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanSubscribeChangeHandler", () => {
            //- arrange

            let dataRows = ["AAA", "BBB", "CCC"];
            let binding = new LocalDataGridBinding(dataRows);
            let handler = (args: DataGridRowsChangedEventArgs) => {
                fail("onChange handler should never be invoked by LocalDataTableBinding!");
            };

            //- act & assert

            binding.changed().bind(handler);
            dataRows.push("DDD"); // nothing should happen here
        });

        //-------------------------------------------------------------------------------------------------------------

        it("IsNotAffectedByChangesInOriginalArray", () => {
            //- arrange

            let dataRows = ["AAA", "BBB", "CCC"];
            let binding = new LocalDataGridBinding(dataRows);
            let handler = (args: DataGridRowsChangedEventArgs) => {
                fail("onChange handler should never be invoked by LocalDataTableBinding!");
            };
            binding.changed().bind(handler);

            //- act

            dataRows[1] = "ZZZ";
            dataRows.push("DDD");

            //- assert

            expect(binding.getRowCount()).toBe(3);
            expect(binding.getRowDataAt(1)).toBe("BBB");
        });

        //-------------------------------------------------------------------------------------------------------------

        it("DoesNotChangeOriginalArray", () => {
            //- arrange

            let dataRows = ["AAA", "BBB", "CCC"];

            //- act

            let binding = new LocalDataGridBinding(dataRows);

            //- assert

            expect(dataRows).toEqual(["AAA", "BBB", "CCC"]);
        });
    });

    //-----------------------------------------------------------------------------------------------------------------

    describe("NestedSetTreeDataGridBinding", () => {

        class TestTreeNode {
            constructor(public value: string, public subNodes?: TestTreeNode[]) { }
        }

        //-------------------------------------------------------------------------------------------------------------

        function createTestTreeData(): TestTreeNode[] {
            return [
                new TestTreeNode('A1', [
                    new TestTreeNode('A1B1'),
                    new TestTreeNode('A1B2')]),
                new TestTreeNode('A2', [
                    new TestTreeNode('A2B1', [
                        new TestTreeNode('A2B1C1'),
                        new TestTreeNode('A2B1C2')]),
                    new TestTreeNode('A2B2', [
                        new TestTreeNode('A2B2C1', [
                            new TestTreeNode('A2B2C1D1')])])]),
                new TestTreeNode('A3', [
                    new TestTreeNode('A3B1', [
                        new TestTreeNode('A3B1C1'),
                        new TestTreeNode('A3B1C2')]),
                    new TestTreeNode('A3B2', [
                        new TestTreeNode('A3B2C1')])]),
            ];
        }

        //-------------------------------------------------------------------------------------------------------------

        function selectVisibleNodeValues(binding: IDataGridBinding): string[] {
            let values: string[] = [];

            for (let i = 0; i < binding.getRowCount(); i++) {
                var rowData = binding.getRowDataAt(i);
                var value = (<TestTreeNode>rowData).value;
                values.push(value);
            }

            return values;
        }

        //-------------------------------------------------------------------------------------------------------------

        it("IsInitiallyCollapsedToRoots", () => {
            //- arrange

            let nodes = createTestTreeData();
            let localBinding = new LocalDataGridBinding(nodes);

            //- act

            let binding = new NestedSetTreeDataGridBinding(localBinding, 'subNodes');

            //- assert

            expect(binding.getRowCount()).toBe(3);
            expect((binding.getRowDataAt(0) as any).value).toBe('A1');
            expect((binding.getRowDataAt(1) as any).value).toBe('A2');
            expect((binding.getRowDataAt(2) as any).value).toBe('A3');
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandNodeInTheMiddle", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1);

            //- assert

            expect(binding.getRowCount()).toBe(5);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual(['A1', 'A2', 'A2B1', 'A2B2', 'A3']);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandNodeInTheMiddleRecursive", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1, true);

            //- assert

            expect(binding.getRowCount()).toBe(9);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B1C1', 'A2B1C2', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandPathInTheMiddle", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1);
            binding.expandRow(3);
            binding.expandRow(4);

            //- assert

            expect(binding.getRowCount()).toBe(7);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandRecursiveMultipleTimes", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1, true);
            binding.expandRow(2, true);
            binding.expandRow(5, true);
            binding.expandRow(6, true);

            //- assert

            expect(binding.getRowCount()).toBe(9);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B1C1', 'A2B1C2', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("IgnoresAttemptToExpandLeafNode", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1, true);
            binding.expandRow(3);
            binding.expandRow(4, true);

            //- assert

            expect(binding.getRowCount()).toBe(9);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B1C1', 'A2B1C2', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanFullyExpandPartiallyExpandedSubtree", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(1);
            binding.expandRow(1, true);

            //- assert

            expect(binding.getRowCount()).toBe(9);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B1C1', 'A2B1C2', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandNodeInTheTop", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(0);

            //- assert

            expect(binding.getRowCount()).toBe(5);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A1B1', 'A1B2', 'A2', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandNodeInTheBottom", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(2);

            //- assert

            expect(binding.getRowCount()).toBe(5);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A3', 'A3B1', 'A3B2'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanExpandSubtreeInTheBottomRecursively", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            //- act

            binding.expandRow(2, true);

            //- assert

            expect(binding.getRowCount()).toBe(8);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A3', 'A3B1', 'A3B1C1', 'A3B1C2', 'A3B2', 'A3B2C1'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanCollapseNodeInTheMiddle", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            binding.expandRow(1, true);

            //- act

            binding.collapseRow(2);

            //- assert

            expect(binding.getRowCount()).toBe(7);

            let visibleNodeValues = selectVisibleNodeValues(binding);

            expect(visibleNodeValues).toEqual([
                'A1', 'A2', 'A2B1', 'A2B2', 'A2B2C1', 'A2B2C1D1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanCollapseNodeInTheTop", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            binding.expandRow(1);
            binding.expandRow(0);

            let visibleNodeValuesBefore = selectVisibleNodeValues(binding);

            //- act

            binding.collapseRow(0);

            //- assert

            expect(visibleNodeValuesBefore).toEqual([
                'A1', 'A1B1', 'A1B2', 'A2', 'A2B1', 'A2B2', 'A3'
            ]);

            expect(binding.getRowCount()).toBe(5);

            let visibleNodeValuesAfter = selectVisibleNodeValues(binding);

            expect(visibleNodeValuesAfter).toEqual([
                'A1', 'A2', 'A2B1', 'A2B2', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanCollapseNodeInTheBottom", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            binding.expandRow(2, true);
            binding.expandRow(1);

            let visibleNodeValuesBefore = selectVisibleNodeValues(binding);

            //- act

            binding.collapseRow(4);

            //- assert

            expect(visibleNodeValuesBefore).toEqual([
                'A1', 'A2', 'A2B1', 'A2B2', 'A3', 'A3B1', 'A3B1C1', 'A3B1C2', 'A3B2', 'A3B2C1'
            ]);

            expect(binding.getRowCount()).toBe(5);

            let visibleNodeValuesAfter = selectVisibleNodeValues(binding);

            expect(visibleNodeValuesAfter).toEqual([
                'A1', 'A2', 'A2B1', 'A2B2', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("IgnoresAttemptToCollapseLeafNode", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            binding.expandRow(2, true);

            let visibleNodeValuesBefore = selectVisibleNodeValues(binding);

            //- act

            binding.collapseRow(7);

            //- assert

            let visibleNodeValuesAfter = selectVisibleNodeValues(binding);

            expect(visibleNodeValuesBefore).toEqual([
                'A1', 'A2', 'A3', 'A3B1', 'A3B1C1', 'A3B1C2', 'A3B2', 'A3B2C1'
            ]);

            expect(visibleNodeValuesAfter).toEqual([
                'A1', 'A2', 'A3', 'A3B1', 'A3B1C1', 'A3B1C2', 'A3B2', 'A3B2C1'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("PreservesExpandedStateOfNodesInCollapsedSubtree", () => {
            //- arrange

            let nodes = createTestTreeData();
            let binding = new NestedSetTreeDataGridBinding(new LocalDataGridBinding(nodes), 'subNodes');

            binding.expandRow(1); // A2
            binding.expandRow(2); // A2B1
            binding.expandRow(5); // A2B2
            binding.collapseRow(1);

            let visibleNodeValuesBefore = selectVisibleNodeValues(binding);

            //- act

            binding.expandRow(1);

            //- assert

            let visibleNodeValuesAfter = selectVisibleNodeValues(binding);

            expect(visibleNodeValuesBefore).toEqual([
                'A1', 'A2', 'A3'
            ]);

            expect(visibleNodeValuesAfter).toEqual([
                'A1', 'A2', 'A2B1', 'A2B1C1', 'A2B1C2', 'A2B2', 'A2B2C1', 'A3'
            ]);
        });

        //-------------------------------------------------------------------------------------------------------------

        it("CanInsertNewRootNodesFromUpstreamBinding", () => {
            //- arrange

            const nodes = createTestTreeData();
            const upstreamBinding = new TestDataGridBinding(nodes);
            const binding = new NestedSetTreeDataGridBinding(upstreamBinding, 'subNodes');

            let visibleNodeValuesBefore = selectVisibleNodeValues(binding);

            //- act

            upstreamBinding.insertRows(3, [
                new TestTreeNode('A4', []),
                new TestTreeNode('A5', [])
            ]);

            //- assert

            let visibleNodeValuesAfter = selectVisibleNodeValues(binding);

            expect(visibleNodeValuesBefore).toEqual([
                'A1', 'A2', 'A3'
            ]);

            expect(visibleNodeValuesAfter).toEqual([
                'A1', 'A2', 'A3', 'A4', 'A5'
            ]);
        });
    });
}