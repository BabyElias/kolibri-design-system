<template>

  <div
    ref="tableWrapper"
    class="k-table-wrapper"
  >
    <template v-if="dataLoading">
      <p><KCircularLoader /></p>
    </template>
    <template v-else>
      <table
        v-if="!isTableEmpty"
        class="k-table"
        role="grid"
      >
        <caption
          v-if="caption"
          class="visuallyhidden"
        >
          {{
            caption
          }}
        </caption>
        <thead>
          <tr ref="stickyHeader">
            <th
              v-for="(header, index) in headers"
              :ref="'header-' + index"
              :key="index"
              tabindex="0"
              :aria-sort="isColumnSortable(index) ? getAriaSort(index) : null"
              :class="{
                [$computedClass(coreOutlineFocus)]: true,
                sortable: isColumnSortable(index),
                'sticky-header': true,
                'sticky-column': index === 0,
              }"
              :style="[
                getHeaderStyle(header),
                isColumnSortActive(index)
                  ? { color: $themeBrand.primary.v_500 }
                  : { color: $themePalette.grey.v_800 },
                { backgroundColor: $themePalette.white },
                isColumnFocused(index) ? { backgroundColor: $themePalette.grey.v_100 } : {},
                { textAlign: getTextAlign(header.dataType) },
              ]"
              role="columnheader"
              data-focus="true"
              :aria-colindex="index + 1"
              @click="sortable ? handleSort(index) : null"
              @keydown="handleKeydown($event, -1, index)"
            >
              <!--@slot Scoped slot for customizing the content of each header cell.
               Provides a header object `header` and its column index `colIndex`.-->
              <slot
                name="header"
                :header="header"
                :colIndex="index"
              >
                {{ header.label }}
              </slot>
              <span
                v-if="isColumnSortable(index)"
                class="sort-icon"
              >
                <span v-if="isColumnSortActive(index) && sortOrder === SORT_ORDER_ASC"><KIcon
                  icon="dropup"
                  :color="
                    isColumnSortActive(index)
                      ? $themeBrand.primary.v_600
                      : $themePalette.grey.v_800
                  "
                /></span>
                <span v-else-if="isColumnSortActive(index) && sortOrder === SORT_ORDER_DESC"><KIcon
                  icon="dropdown"
                  :color="
                    isColumnSortActive(index)
                      ? $themeBrand.primary.v_600
                      : $themePalette.grey.v_800
                  "
                /></span>
                <span v-else><KIcon
                  icon="sortColumn"
                  :color="$themePalette.grey.v_800"
                /></span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in finalRows"
            :key="rowIndex"
            :style="getRowStyle(rowIndex)"
            @mouseover="handleRowMouseOver(rowIndex)"
            @mouseleave="handleRowMouseLeave"
          >
            <KTableGridItem
              v-for="(col, colIndex) in row"
              :ref="'cell-' + rowIndex + '-' + colIndex"
              :key="colIndex"
              :content="col"
              :dataType="headers[colIndex].dataType"
              :minWidth="headers[colIndex].minWidth"
              :width="headers[colIndex].width"
              :rowIndex="rowIndex"
              :colIndex="colIndex"
              :textAlign="getTextAlign(headers[colIndex].dataType)"
              :class="{
                'sticky-column': colIndex === 0,
              }"
              :style="getCellStyle(rowIndex, colIndex)"
              data-focus="true"
              role="gridcell"
              :aria-colindex="colIndex + 1"
              @keydown="handleKeydown($event, rowIndex, colIndex)"
            >
              <template #default="slotProps">
                <!--@slot Scoped slot for customizing the content of each data cell.
                 Provides the content of a data cell `content`, its row index `rowIndex`,
                 its column index `colIndex`, and the corresponding whole row object `row`.-->
                <slot
                  name="cell"
                  :content="slotProps.content"
                  :rowIndex="rowIndex"
                  :colIndex="colIndex"
                  :row="row"
                >
                  {{ slotProps.content }}
                </slot>
              </template>
            </KTableGridItem>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="empty-message"
      >
        {{ emptyMessage }}
      </div>
    </template>
  </div>

</template>


<script>

  import { ref, computed, watch } from 'vue';
  import useSorting, {
    SORT_ORDER_ASC,
    SORT_ORDER_DESC,
    DATA_TYPE_OTHERS,
    DATA_TYPE_NUMERIC,
  } from './useSorting';
  import KTableGridItem from './KTableGridItem.vue';

  export default {
    name: 'KTable',
    components: {
      KTableGridItem,
    },
    setup(props, { emit }) {
      const headers = ref(props.headers);
      const rows = ref(props.rows);
      const disableBuiltinSorting = ref(props.disableBuiltinSorting);

      const defaultSort = ref({
        index: props.headers.findIndex(h => h.columnId === props.defaultSort.columnId),
        direction: props.defaultSort.direction,
      });

      const {
        sortKey,
        sortOrder,
        sortedRows,
        handleSort: localHandleSort,
        getAriaSort,
      } = useSorting(headers, rows, defaultSort, disableBuiltinSorting);

      const isTableEmpty = computed(() => sortedRows.value.length === 0);

      watch(
        () => props.rows,
        newRows => {
          rows.value = newRows;
        },
      );

      const handleSort = index => {
        if (headers.value[index].dataType === DATA_TYPE_OTHERS || !props.sortable) {
          return;
        }
        localHandleSort(index);
        if (props.disableBuiltinSorting) {
          emit('changeSort', { sortKey: index, sortOrder: sortOrder.value });
        }
      };

      const getHeaderStyle = header => {
        const style = {};
        if (header.minWidth) style.minWidth = header.minWidth;
        if (header.width) style.width = header.width;
        return style;
      };

      return {
        sortKey,
        sortOrder,
        finalRows: sortedRows,
        handleSort,
        getAriaSort,
        SORT_ORDER_ASC,
        SORT_ORDER_DESC,
        DATA_TYPE_OTHERS,
        getHeaderStyle,
        isTableEmpty,
      };
    },
    props: {
      /**
       * An array of objects:
       * `{ label, dataType, minWidth, width, columnId }`
       * representing the headers of the table.
       * The `dataType` can be one of `'string'`, `'number'`, `'date'`, or `'undefined'`.
       * `label` and `dataType` are required. `minWidth` and `width` are optional.
       * `columnId` is an unique identifier for the column, and can be a `number` or a `string`.
       */
      headers: {
        type: Array,
        required: true,
        validator: function (value) {
          const uniqueColumnIds = new Set(value.map(h => h.columnId));

          return (
            uniqueColumnIds.size == value.length &&
            value.every(
              header =>
                ['label', 'dataType', 'columnId'].every(key => key in header) &&
                ['string', 'number', 'date', 'undefined'].includes(header.dataType) &&
                ['string', 'number'].includes(typeof header.columnId),
            )
          );
        },
      },
      /**
       * An array of arrays representing the rows of the table.
       * Each row should have the same number of elements as the headers array.
       */
      rows: {
        type: Array,
        required: true,
      },
      /**
       * The caption of the table
       */
      caption: {
        type: String,
        required: true,
      },
      /**
       * Enables or disables sorting functionality for the table headers.
       */
      sortable: {
        type: Boolean,
        default: false,
      },
      /**
       * The message to display when the table is empty.
       */
      emptyMessage: {
        type: String,
        default: 'No data available',
      },
      /**
       * Indicates whether the data is currently being loaded.
       */
      dataLoading: {
        type: Boolean,
        default: false,
      },
      /**
       * Indicates whether the table is to be sorted by default by any header or not.
       * By default it is an empty object which means no default sorting is to be used.
       * It accepts a configuration object `{ columnId, direction }`.
       * `columnId` references a `columnId` defined for a header in `headers`.
       * This specifies a column by which the table should be sorted when initially loaded.
       * `direction` can be `'asc'` for ascending or `'desc'` for descending sort direction.
       */
      defaultSort: {
        type: Object,
        required: false,
        default: () => ({}),
        validator: function (value) {
          if (Object.keys(value).length === 0) {
            return true;
          }

          return (
            ['columnId', 'direction'].every(key => key in value) &&
            ['asc', 'desc'].includes(value.direction) &&
            ['string', 'number'].includes(typeof value.columnId)
          );
        },
      },
      /**
       * Disables built-in sort function.
       * This is useful when you want to define your own sorting logic.
       * Refer to the examples above for more details.
       */
      disableBuiltinSorting: {
        type: Boolean,
        default: false,
        required: false,
      },
    },
    data() {
      return {
        focusedRowIndex: null,
        focusedColIndex: null,
        hoveredRowIndex: null,
      };
    },
    computed: {
      coreOutlineFocus() {
        return {
          ':focus': {
            ...this.$coreOutline,
            outlineOffset: '-2px',
          },
        };
      },
      getRowStyle() {
        return rowIndex => {
          return this.hoveredRowIndex === rowIndex || this.focusedRowIndex === rowIndex
            ? { backgroundColor: this.$themePalette.grey.v_100 }
            : {};
        };
      },
      getCellStyle() {
        return (rowIndex, colIndex) => {
          const styles = [];
          if (colIndex === 0) {
            styles.push({ backgroundColor: this.$themePalette.white });
          }
          if (
            (this.hoveredRowIndex === rowIndex || this.focusedRowIndex === rowIndex) &&
            colIndex === 0
          ) {
            styles.push({ backgroundColor: this.$themePalette.grey.v_100 });
          }
          return styles;
        };
      },
      isColumnSortActive() {
        return colIndex => this.sortKey === colIndex;
      },
      isSortableColumn() {
        return colIndex => this.headers[colIndex].dataType !== DATA_TYPE_OTHERS;
      },
      isColumnFocused() {
        return colIndex => this.focusedColIndex === colIndex;
      },
      isColumnSortable() {
        return colIndex => this.sortable && this.headers[colIndex].dataType !== DATA_TYPE_OTHERS;
      },
    },
    watch: {
      // Use a watcher on props to perform validation on props.
      // This is required as we need access to multiple props simultaneously in some validations.
      $props: {
        immediate: true,
        handler() {
          if (this.defaultSort.columnId) {
            const allHeaderColumnIds = this.headers.map(h => h.columnId);
            if (!allHeaderColumnIds.includes(this.defaultSort.columnId)) {
              // eslint-disable-next-line no-console
              console.error(
                `The columnId used for default sorting is ${this.defaultSort.columnId}, but the same was not found to be defined in any headers.`,
              );
            }
          }
        },
      },
    },
    methods: {
      /**
       * Takes care of
       *  - keyboard navigation focus trap
       *  - the arrow keys navigation flow
       *  - the tab keys navigation flow
       *  - access to focusable elements within a cell via tab and shift tab keys
       *  - triggering sort on the enter key
       *  - header highlight
       */
      handleKeydown(event, rowIndex, colIndex) {
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            this.handleArrowKeys(event.key, rowIndex, colIndex);
            break;
          case 'Enter':
            this.handleEnterKey(rowIndex, colIndex);
            break;
          case 'Tab':
            if (!event.shiftKey) {
              this.handleTabKey(event, rowIndex, colIndex);
            } else {
              this.handleShiftTabKey(event, rowIndex, colIndex);
            }
            break;
          default:
            break;
        }
      },

      handleArrowKeys(key, rowIndex, colIndex) {
        const totalRows = this.rows.length;
        const totalCols = this.headers.length;
        const lastRowIndex = totalRows - 1;
        const lastColIndex = totalCols - 1;
        let nextRowIndex = rowIndex;
        let nextColIndex = colIndex;

        switch (key) {
          case 'ArrowUp':
            nextRowIndex = rowIndex === -1 ? lastRowIndex : rowIndex - 1;
            break;
          case 'ArrowDown':
            nextRowIndex = rowIndex === -1 ? 0 : rowIndex === lastRowIndex ? -1 : rowIndex + 1;
            break;
          case 'ArrowLeft':
            if (rowIndex === -1) {
              nextColIndex = colIndex > 0 ? colIndex - 1 : lastColIndex;
              nextRowIndex = colIndex === 0 ? lastRowIndex : -1;
            } else {
              nextColIndex = colIndex > 0 ? colIndex - 1 : lastColIndex;
              nextRowIndex = colIndex === 0 ? (rowIndex > 0 ? rowIndex - 1 : -1) : rowIndex;
            }
            break;
          case 'ArrowRight':
            if (colIndex === lastColIndex) {
              nextColIndex = 0;
              nextRowIndex = rowIndex === lastRowIndex ? -1 : rowIndex + 1;
            } else {
              nextColIndex = colIndex + 1;
            }
            break;
        }
        this.updateFocusState(nextRowIndex, nextColIndex);
        event.preventDefault();
      },
      handleEnterKey(rowIndex, colIndex) {
        if (rowIndex === -1 && this.sortable) {
          this.handleSort(colIndex);
        }
      },
      handleTabKey(event, rowIndex, colIndex) {
        const cell = this.getCell(rowIndex, colIndex);
        const focusableElements = this.getFocusableElements(cell);
        const focusedIndex = focusableElements.indexOf(document.activeElement);

        // If there is another focusable element in the cell, focus on the same
        if (focusedIndex < focusableElements.length - 1) {
          focusableElements[focusedIndex + 1].focus();
          this.updateFocusState(rowIndex, colIndex, false);
          event.preventDefault();
          return;
        }

        // If there is a next cell in the table, focus on the same
        const [nextRowIndex, nextColIndex] = this.getNextCellCoordinates(rowIndex, colIndex);
        if (nextColIndex !== null) {
          this.updateFocusState(nextRowIndex, nextColIndex);
          event.preventDefault();
          return;
        }

        // No next cell, so we are exiting the table
        // Allow default tab behavior, and clear the highlighted state
        this.clearHighlighted();
      },
      handleShiftTabKey(event, rowIndex, colIndex) {
        const cell = this.getCell(rowIndex, colIndex);
        const focusableElements = this.getFocusableElements(cell);
        const focusedIndex = focusableElements.indexOf(document.activeElement);

        if (focusedIndex > 0) {
          // There is a focusable element before the current one
          focusableElements[focusedIndex - 1].focus();
          this.updateFocusState(rowIndex, colIndex, false);
          event.preventDefault();
          return;
        }

        const [prevRowIndex, prevColIndex] = this.getPreviousCellCoordinates(rowIndex, colIndex);
        // If there is a previous cell, shift focus to same
        if (prevRowIndex != null) {
          const prevCell = this.getCell(prevRowIndex, prevColIndex);
          const prevFocusableElements = this.getFocusableElements(prevCell);
          prevFocusableElements[prevFocusableElements.length - 1].focus();
          this.updateFocusState(prevRowIndex, prevColIndex, false);
          event.preventDefault();
          return;
        }

        // No previous cell, so we are exiting the table
        // Allow default tab behavior, and clear the highlighted state
        this.clearHighlighted();
      },
      updateFocusState(nextRowIndex, nextColIndex, shouldFocusCell = true) {
        this.focusedRowIndex = nextRowIndex === -1 ? null : nextRowIndex;
        this.focusedColIndex = nextColIndex;
        this.highlightHeader(nextColIndex);
        // Focus the cell only if it is necessary
        if (shouldFocusCell) {
          this.focusCell(nextRowIndex, nextColIndex);
        }
      },
      /*
       * Clears the highlighted state of the table.
       */
      clearHighlighted() {
        this.focusedRowIndex = null;
        this.focusedColIndex = null;
      },
      /*
       * Returns all focusable elements within a cell. The elements are returned in the
       * order they should be navigated to when using Tab navigation.
       * The first element in the array is the cell itself, and then later the focusable elements
       * present in the cell are returned.
       * @param {HTMLElement} cell - The cell element.
       * @returns {HTMLElement[]} - An array of focusable elements within the cell.
       */
      getFocusableElements(cell) {
        if (!cell) return [];

        const focusableSelectors = ['button', 'a', 'input', 'select', 'textarea'];
        return [
          cell,
          ...focusableSelectors
            .flatMap(selector => Array.from(cell.getElementsByTagName(selector)))
            .filter(this.isFocusable),
        ];
      },
      /*
       * Checks if the element is focusable.
       * @param {HTMLElement} item - The element to check.
       * @returns {boolean} - True if the element is focusable, false otherwise.
       */
      isFocusable(item) {
        if (item.tabIndex < 0) {
          return false;
        }
        switch (item.tagName) {
          case 'A':
            return !!item.href;
          case 'INPUT':
            return item.type !== 'hidden' && !item.disabled;
          case 'SELECT':
          case 'TEXTAREA':
          case 'BUTTON':
            return !item.disabled;
          default:
            return false;
        }
      },
      /*
       * Returns the coordinates of the next cell in the tab navigation order.
       * Returns `[nextRowIndex, nextColIndex]` if the cell is available,
       * else sets both the values to null
       */
      getNextCellCoordinates(rowIndex, colIndex) {
        const totalRows = this.rows.length;
        const totalCols = this.headers.length;
        let nextRowIndex = rowIndex;
        let nextColIndex = colIndex;

        if (colIndex < totalCols - 1) {
          nextColIndex = colIndex + 1;
        } else {
          // Need to go to the first cell of the next row
          if (rowIndex !== totalRows - 1) {
            nextRowIndex = rowIndex + 1;
            nextColIndex = 0;
          } else {
            // Have reached the end of the table
            nextRowIndex = null;
            nextColIndex = null;
          }
        }
        return [nextRowIndex, nextColIndex];
      },
      /*
       * Returns the coordinates of the previous cell based on the tab navigation order.
       * Returns `[prevRowIndex, prevColIndex]` if cell is available, else sets
       * both of the values to null.
       */
      getPreviousCellCoordinates(rowIndex, colIndex) {
        const totalCols = this.headers.length;
        let prevRowIndex = rowIndex;
        let prevColIndex = colIndex;

        if (colIndex > 0) {
          prevColIndex = colIndex - 1;
        } else {
          // Need to go to the last cell of the previous row
          if (rowIndex > -1) {
            prevRowIndex = rowIndex - 1;
            prevColIndex = totalCols - 1;
          } else {
            // We have reached the first cell of the header
            // and there is no previous cell available
            prevRowIndex = null;
            prevColIndex = null;
          }
        }
        return [prevRowIndex, prevColIndex];
      },
      getCell(rowIndex, colIndex) {
        if (rowIndex === -1) {
          return this.$refs[`header-${colIndex}`][0];
        } else {
          return this.$refs[`cell-${rowIndex}-${colIndex}`][0].$el;
        }
      },
      scrollCellIntoView(cell) {
        if (cell) {
          cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

          // Adjust scroll position to account for sticky headers
          const stickyHeader = this.$refs.stickyHeader;
          const stickyColumn = this.$refs['header-0'][0];
          const tableWrapper = this.$refs.tableWrapper;

          const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
          const stickyColumnWidth = stickyColumn ? stickyColumn.offsetWidth : 0;

          const cellRect = cell.getBoundingClientRect();
          const wrapperRect = tableWrapper.getBoundingClientRect();

          if (cellRect.top < wrapperRect.top + stickyHeaderHeight) {
            tableWrapper.scrollTop -= wrapperRect.top + stickyHeaderHeight - cellRect.top;
          }
          if (cellRect.left < wrapperRect.left + stickyColumnWidth) {
            tableWrapper.scrollLeft -= wrapperRect.left + stickyColumnWidth - cellRect.left;
          }
        }
      },
      focusCell(rowIndex, colIndex) {
        let nextCell;
        if (rowIndex === -1) {
          nextCell = this.$refs[`header-${colIndex}`][0];
        } else {
          nextCell = this.$refs[`cell-${rowIndex}-${colIndex}`][0].$el;
        }
        // Ensured the focused cell is smoothly scrolled into view.
        if (nextCell) {
          nextCell.focus();
          this.scrollCellIntoView(nextCell);
        }
      },
      handleRowMouseOver(rowIndex) {
        this.hoveredRowIndex = rowIndex;
      },
      handleRowMouseLeave() {
        this.hoveredRowIndex = null;
      },
      setHighlightHeader(header, highlight) {
        header.style.backgroundColor = highlight
          ? this.$themePalette.grey.v_100
          : this.$themePalette.white;
      },
      highlightHeader(colIndex) {
        const headers = this.$refs;
        Object.keys(headers).forEach(refKey => {
          if (refKey.startsWith('header-')) {
            const index = parseInt(refKey.split('-')[1], 10);
            this.setHighlightHeader(headers[refKey][0], index === colIndex);
          }
        });
      },
      getTextAlign(dataType) {
        const alignLtr = dataType === DATA_TYPE_NUMERIC ? 'right' : 'left';
        if (this.isRtl && alignLtr === 'right') {
          return 'left';
        }
        if (this.isRtl && alignLtr === 'left') {
          return 'right';
        }
        return alignLtr;
      },
    },
  };

</script>


<style scoped>

  .k-table-wrapper {
    position: relative;
    height: auto;
    overflow: auto;
  }

  .k-table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    position: relative;
    z-index: auto;
    padding: 8px;
  }

  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .sticky-column {
    position: sticky;
    left: 0;
    z-index: 1;
  }

  th.sticky-header.sticky-column,
  td.sticky-header.sticky-column {
    z-index: 3;
  }

  .sortable {
    cursor: pointer;
  }

  .empty-message {
    margin-top: 16px;
    margin-bottom: 16px;
  }

</style>
