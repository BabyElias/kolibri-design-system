<template>

  <div class="ui-autocomplete" :class="classes">
    <div v-if="icon || $slots.icon" class="ui-autocomplete__icon-wrapper">
      <slot name="icon">
        <UiIcon :icon="icon" 
                :iconStyle="{ color: $themePalette.grey.v_700 }"
        />
      </slot>
    </div>

    <div class="ui-autocomplete__content">
      <label class="ui-autocomplete__label">
        <div
          v-if="label || $slots.default"
          class="ui-autocomplete__label-text"
          :class="labelClasses"
          :style="colorStyle"
        >
          <slot>{{ label }}</slot>
        </div>

        <UiIcon
          v-show="!disabled && valueLength > 0"
          class="ui-autocomplete__clear-button"
          :style="{ color: $themePalette.grey.v_700 }"
          title="Clear"

          @click.native="updateValue('')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M18.984 6.422L13.406 12l5.578 5.578-1.406 1.406L12 13.406l-5.578 5.578-1.406-1.406L10.594 12 5.016 6.422l1.406-1.406L12 10.594l5.578-5.578z" />
          </svg>
        </UiIcon>

        <input
          ref="input"
          autocomplete="off"
          class="ui-autocomplete__input"
          :style="{ color: $themeBrand.primary.v_600 ,
                    'border-bottom-color': isActive ?
                      $themeBrand.primary.v_600 : $themePalette.grey.v_700
          }"
          :disabled="disabled"
          :name="name"
          :placeholder="hasFloatingLabel ? null : placeholder"
          :readonly="readonly ? readonly : null"
          :tabindex="tabindex"
          :value="value"

          v-autofocus="autofocus"
          @blur="onBlur"
          @change="onChange"
          @focus="onFocus"
          @input="updateValue($event.target.value)"
          @keydown.down.prevent="highlightSuggestion(highlightedIndex + 1)"
          @keydown.enter="selectHighlighted(highlightedIndex, $event)"
          @keydown.esc="closeDropdown"
          @keydown.tab="closeDropdown"

          @keydown.up.prevent="highlightSuggestion(highlightedIndex - 1)"
        >

        <ul v-show="showDropdown" class="ui-autocomplete__suggestions">
          <UiAutocompleteSuggestion
            v-for="(suggestion, index) in matchingSuggestions"

            ref="suggestions"
            :key="index"
            :highlighted="highlightedIndex === index"
            :keys="keys"
            :suggestion="suggestion"

            :type="type"

            @click.native="selectSuggestion(suggestion)"
          >
            <slot
              name="suggestion"

              :highlighted="highlightedIndex === index"
              :index="index"
              :suggestion="suggestion"
            ></slot>
          </UiAutocompleteSuggestion>
        </ul>
      </label>

      <div v-if="hasFeedback" class="ui-autocomplete__feedback">
        <div v-if="showError" class="ui-autocomplete__feedback-text">
          <slot name="error">
            {{ error }}
          </slot>
        </div>

        <div v-else-if="showHelp" class="ui-autocomplete__feedback-text">
          <slot name="help">
            {{ help }}
          </slot>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

  import fuzzysearch from 'fuzzysearch';
  import autofocus from './directives/autofocus';
  import UiAutocompleteSuggestion from './UiAutocompleteSuggestion.vue';
  import UiIcon from './UiIcon.vue';

  export default {
    name: 'UiAutocomplete',

    components: {
      UiAutocompleteSuggestion,
      UiIcon,
    },

    directives: {
      autofocus,
    },

    props: {
      name: String,
      placeholder: String,
      tabindex: [String, Number],
      value: {
        type: [String, Number],
        default: '',
      },
      icon: String,
      iconPosition: {
        type: String,
        default: 'left', // 'left' or 'right'
      },
      label: String,
      floatingLabel: {
        type: Boolean,
        default: false,
      },
      help: String,
      error: String,
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'simple', // 'simple' or 'image'
      },
      suggestions: {
        type: Array,
        default() {
          return [];
        },
      },
      limit: {
        type: Number,
        default: 8,
      },
      append: {
        type: Boolean,
        default: false,
      },
      appendDelimiter: {
        type: String,
        default: ', ',
      },
      minChars: {
        type: Number,
        default: 2,
      },
      showOnUpDown: {
        type: Boolean,
        default: true,
      },
      autofocus: {
        type: Boolean,
        default: false,
      },
      filter: Function,
      sort: Function,
      highlightOnFirstMatch: {
        type: Boolean,
        default: true,
      },
      cycleHighlight: {
        type: Boolean,
        default: true,
      },
      keys: {
        type: Object,
        default() {
          return {
            label: 'label',
            value: 'value',
            image: 'image',
          };
        },
      },
      invalid: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        initialValue: this.value,
        isActive: false,
        isTouched: false,
        showDropdown: false,
        highlightedIndex: -1,
      };
    },

    computed: {
      classes() {
        return [
          `ui-autocomplete--type-${this.type}`,
          `ui-autocomplete--icon-position-${this.iconPosition}`,
          { 'is-active': this.isActive },
          { 'is-invalid': this.invalid },
          { 'is-touched': this.isTouched },
          { 'is-disabled': this.disabled },
          { 'has-label': this.hasLabel },
          { 'has-floating-label': this.hasFloatingLabel },
        ];
      },
      colorStyle() {
    return this.isActive && !this.disabled ? {
      color: this.$themeBrand.primary.v_600 
    } : { color: $themePalette.grey.v_700 };
  },
      labelClasses() {
        return {
          'is-inline': this.hasFloatingLabel && this.isLabelInline,
          'is-floating': this.hasFloatingLabel && !this.isLabelInline,
        };
      },

      hasLabel() {
        return Boolean(this.label) || Boolean(this.$slots.default);
      },

      hasFloatingLabel() {
        return this.hasLabel && this.floatingLabel;
      },

      isLabelInline() {
        return this.valueLength === 0 && !this.isActive;
      },

      valueLength() {
        return this.value ? this.value.length : 0;
      },

      hasFeedback() {
        return this.showError || this.showHelp;
      },

      showError() {
        return this.invalid && (Boolean(this.error) || Boolean(this.$slots.error));
      },

      showHelp() {
        return Boolean(this.help) || Boolean(this.$slots.help);
      },

      matchingSuggestions() {
        const suggestions = this.suggestions.filter(suggestion => {
          if (this.filter) {
            return this.filter(suggestion, this.value, this.defaultFilter);
          }

          const query = this.value === null ? '' : this.value;

          return this.defaultFilter(suggestion, query);
        });

        if (this.sort) {
          suggestions.sort(this.sort.bind(this));
        }

        return suggestions.slice(0, this.limit);
      },
    },

    watch: {
      value() {
        if (this.isActive && this.valueLength >= this.minChars) {
          this.openDropdown();
        }

        this.highlightedIndex = this.highlightOnFirstMatch ? 0 : -1;
      },
    },

    created() {
      // Normalize the value to an empty string if it's null
      if (this.value === null) {
        this.initialValue = '';
        this.updateValue('');
      }
    },

    mounted() {
      document.addEventListener('click', this.onExternalClick);
    },

    beforeDestroy() {
      document.removeEventListener('click', this.onExternalClick);
    },

    methods: {
      defaultFilter(suggestion, query) {
        const text = suggestion[this.keys.label] || suggestion;

        if (typeof query === 'string') {
          query = query.toLowerCase();
        }

        return fuzzysearch(query, text.toLowerCase());
      },

      selectSuggestion(suggestion) {
        let value;

        if (this.append) {
          value += this.appendDelimiter + (suggestion[this.keys.value] || suggestion);
        } else {
          value = suggestion[this.keys.value] || suggestion;
        }

        this.updateValue(value);
        this.$emit('select', suggestion);

        this.$nextTick(() => {
          this.closeDropdown();
          this.$refs.input.focus();
        });
      },

      highlightSuggestion(index) {
        const firstIndex = 0;
        const lastIndex = this.$refs.suggestions.length - 1;

        if (index === -2) {
          // Allows for cycling from first to last when cycleHighlight is disabled
          index = lastIndex;
        } else if (index < firstIndex) {
          index = this.cycleHighlight ? lastIndex : index;
        } else if (index > lastIndex) {
          index = this.cycleHighlight ? firstIndex : -1;
        }

        this.highlightedIndex = index;

        if (this.showOnUpDown) {
          this.openDropdown();
        }

        if (index < firstIndex || index > lastIndex) {
          this.$emit('highlight-overflow', index);
        } else {
          this.$emit('highlight', this.$refs.suggestions[index].suggestion, index);
        }
      },

      selectHighlighted(index, e) {
        if (this.showDropdown && this.$refs.suggestions.length > 0) {
          e.preventDefault();
          this.selectSuggestion(this.$refs.suggestions[index].suggestion);
        }
      },

      focus() {
        this.$refs.input.focus();
      },

      openDropdown() {
        if (!this.showDropdown) {
          this.showDropdown = true;
          this.$emit('dropdown-open');
        }
      },

      closeDropdown() {
        if (this.showDropdown) {
          this.$nextTick(() => {
            this.showDropdown = false;
            this.highlightedIndex = -1;
            this.$emit('dropdown-close');
          });
        }
      },

      updateValue(value) {
        this.$emit('input', value);
      },

      onFocus(e) {
        this.isActive = true;
        this.$emit('focus', e);
      },

      onChange(e) {
        this.$emit('change', this.value, e);
      },

      onBlur(e) {
        this.isActive = false;
        this.$emit('blur', e);

        if (!this.isTouched) {
          this.isTouched = true;
          this.$emit('touch');
        }
      },

      onExternalClick(e) {
        if (!this.$el.contains(e.target) && this.showDropdown) {
          this.closeDropdown();
        }
      },

      reset() {
        // Blur input before resetting to avoid "required" errors
        // when the input is blurred after reset
        if (document.activeElement === this.$refs.input) {
          document.activeElement.blur();
        }

        // Reset state
        this.updateValue(this.initialValue);
        this.isTouched = false;
      },
    },
  };

</script>

<style lang="scss">

  @import './styles/imports';
  @import '../styles/definitions';

  .ui-autocomplete {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: $ui-input-margin-bottom;
    font-family: $font-stack;

    &:hover:not(.is-disabled) {
      .ui-autocomplete__label-text {
        color: $ui-input-label-color--hover;
      }

      .ui-autocomplete__input {
        border-bottom-color: $ui-input-border-color--hover;
      }
    }

    &.is-active:not(.is-disabled) {
      .ui-autocomplete__label-text,
      .ui-autocomplete__icon-wrapper .ui-icon {
        color: inherit;
      }

      .ui-autocomplete__input {
        border-bottom-width: $ui-input-border-width--active;
      }
    }

    &.has-floating-label {
      .ui-autocomplete__label-text {
        // Behaves like a block, but width is the width of its content.
        // Needed here so label doesn't overflow parent when scaled.
        display: table;

        &.is-inline {
          cursor: text;
          transform: translateY($ui-input-label-top--inline) scale(1.1);
        }

        &.is-floating {
          transform: translateY(0) scale(1);
        }
      }
    }

    &.has-label {
      .ui-autocomplete__icon-wrapper {
        padding-top: $ui-input-icon-margin-top--with-label;
      }

      .ui-autocomplete__clear-button {
        top: $ui-input-button-margin-top--with-label;
      }
    }

    &.is-invalid:not(.is-disabled) {
      .ui-autocomplete__label-text,
      .ui-autocomplete__icon-wrapper .ui-icon {
        color: $ui-input-label-color--invalid;
      }

      .ui-autocomplete__input {
        border-bottom-color: $ui-input-border-color--invalid;
      }

      .ui-autocomplete__feedback {
        color: $ui-input-feedback-color--invalid;
      }
    }

    &.is-disabled {
      .ui-autocomplete__input {
        color: $ui-input-text-color--disabled;
        border-bottom-style: $ui-input-border-style--disabled;
        border-bottom-width: $ui-input-border-width--active;
      }

      .ui-autocomplete__icon-wrapper .ui-icon {
        opacity: $ui-input-icon-opacity--disabled;
      }

      .ui-autocomplete__feedback {
        opacity: $ui-input-feedback-opacity--disabled;
      }
    }
  }

  .ui-autocomplete__label {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .ui-autocomplete__icon-wrapper {
    flex-shrink: 0;
    padding-top: $ui-input-icon-margin-top;
    margin-right: $ui-input-icon-margin-right;

    .ui-icon {
      color: inherit;
    }
  }

  .ui-autocomplete__content {
    flex-grow: 1;
  }

  .ui-autocomplete__label-text {
    margin-bottom: $ui-input-label-margin-bottom;
    font-size: $ui-input-label-font-size;
    line-height: $ui-input-label-line-height;
    cursor: default;
    transition: color 0.1s ease, transform 0.2s ease;
    transform-origin: left;
  }

  .ui-autocomplete__input {
    width: 100%;
    height: $ui-input-height;
    padding: 0;
    font-family: inherit;
    font-size: $ui-input-text-font-size;
    font-weight: normal;
    color: $ui-input-text-color;
    cursor: auto;
    background: none;
    border: none;
    border-bottom-style: solid;
    border-bottom-width: $ui-input-border-width;
    border-radius: 0;
    outline: none;
    transition: border 0.1s ease;

    // Hide Edge and IE input clear button
    &::-ms-clear {
      display: none;
    }
  }

  .ui-autocomplete__clear-button {
    position: absolute;
    top: $ui-input-button-margin-top;
    right: 0;
    font-size: $ui-input-button-size;
    cursor: pointer;
    &:hover {
      color: $ui-input-button-color--hover;
    }
  }

  .ui-autocomplete__suggestions {
    @extend %dropshadow-1dp; 
    position: absolute;
    z-index: $z-index-dropdown;
    display: block;
    min-width: 100%;
    padding: 0;
    margin: 0;
    margin-bottom: rem(8px);
    color: $primary-text-color;
    list-style-type: none;
    background-color: white;
   
  }

  .ui-autocomplete__feedback {
    position: relative;
    padding-top: $ui-input-feedback-padding-top;
    margin: 0;
    font-size: $ui-input-feedback-font-size;
    line-height: $ui-input-feedback-line-height;
    color: $ui-input-feedback-color;
  }

  // ================================================
  // Icon positions
  // ================================================

  .ui-autocomplete--icon-position-right {
    .ui-autocomplete__icon-wrapper {
      order: 1;
      margin-right: 0;
      margin-left: rem(8px);
    }
  }

</style>
