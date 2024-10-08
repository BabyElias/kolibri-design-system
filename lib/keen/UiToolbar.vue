<template>

  <div class="ui-toolbar" :class="classes">
    <div class="ui-toolbar__left">
      <div v-if="!removeNavIcon" class="ui-toolbar__nav-icon">
        <slot name="icon">
          <UiIconButton
            size="large"
            type="secondary"

            :color="textColor"
            :icon="navIcon"

            @click="navIconClick"
          />
        </slot>
      </div>

      <div v-if="brand || $slots.brand" class="ui-toolbar__brand">
        <slot name="brand">
          <div class="ui-toolbar__brand-text">
            {{ brand }}
          </div>
        </slot>
      </div>
      <slot>
        <div v-if="title" class="ui-toolbar__title">
          {{ title }}
        </div>
      </slot>
      <slot name="navigation" class="ui-toolbar__nav"></slot>
    </div>

    

    <div class="ui-toolbar__right">
      <slot name="actions"></slot>
    </div>

    <UiProgressLinear
      v-show="loading"
      class="ui-toolbar__progress"
      :color="progressColor"
    />
  </div>

</template>

<script>

  import UiIconButton from './UiIconButton.vue';
  import UiProgressLinear from './UiProgressLinear.vue';

  export default {
    name: 'UiToolbar',

    components: {
      UiIconButton,
      UiProgressLinear,
    },

    props: {
      type: {
        type: String,
        default: 'default', // 'default', 'colored' or 'clear' - colored is brand primary color
      },
      textColor: {
        type: String,
        default: 'black', // 'black' or 'white'
      },
      title: String,
      brand: String,
      removeBrandDivider: {
        type: Boolean,
        default: false,
      },
      navIcon: {
        type: String,
        default: 'menu',
      },
      removeNavIcon: {
        type: Boolean,
        default: false,
      },
      raised: {
        type: Boolean,
        default: true,
      },
      progressPosition: {
        type: String,
        default: 'bottom', // 'top' or 'bottom'
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      classes() {
        return [
          `ui-toolbar--type-${this.type}`,
          `ui-toolbar--text-color-${this.textColor}`,
          `ui-toolbar--progress-position-${this.progressPosition}`,
          { 'is-raised': this.raised },
        ];
      },

      progressColor() {
        return this.textColor === 'black' ? 'primary' : 'white';
      },

      hasBrandDivider() {
        return this.removeBrandDivider ? false : this.brand || this.$slots.brand;
      },
    },

    methods: {
      navIconClick() {
        this.$emit('nav-icon-click');
      },
    },
  };

</script>

<style lang="scss">
  @import '../styles/definitions';
  @import './styles/imports';

  $ui-toolbar-font-size: rem(18px) !default;
  $ui-toolbar-height: rem(56px) !default;

  .ui-toolbar {
    position: relative;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    height: $ui-toolbar-height;
    padding-left: rem(16px);
    max-width: 100%;
    font-family: inherit;
    font-size: $ui-toolbar-font-size;

    &.is-raised {
      @extend %dropshadow-2dp;
    }

    &:not(.is-raised).ui-toolbar--type-default {
      border-bottom: rem(1px) solid $divider-color;
    }

    .ui-icon-button {
      width: rem(48px);
      height: rem(48px);
    }
  }

  .ui-toolbar__left {
    display: inline-flex;
  }

  .ui-toolbar__nav-icon {
    margin-right: rem(8px);
    margin-left: rem(-16px);
  }

  .ui-toolbar__nav {
    margin-right: rem(8px);
    margin-left: rem(-16px);
    display: flex;
    align-items: bottom;
    margin-left: 16px;
  }

  .ui-toolbar__brand {
    min-width: rem(160px);
  }

  .ui-toolbar__brand-text {
    flex-grow: 1;
    padding-right: rem(8px);
  }

  .ui-toolbar__body {

    &.has-brand-divider {
      padding-left: rem(24px);
      border-left-style: solid;
      border-left-width: rem(1px);
    }
  }

  .ui-toolbar__right {
    display: inline-block;
  }

  .ui-toolbar__progress {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: rem(3px);
  }

  // ================================================
  // Types
  // ================================================

  .ui-toolbar--type-default {
    background-color: white;
  }

  .ui-toolbar--type-colored {
    background-color: $brand-primary-color;
  }

  .ui-toolbar--type-clear {
    background-color: transparent;
    border: none;
    box-shadow: none;
  }

  // ================================================
  // Text colors
  // ================================================

  .ui-toolbar--text-color-black {
    color: $primary-text-color;

    .ui-toolbar__body {
      border-left-color: rgba(black, 0.15);
    }
  }

  .ui-toolbar--text-color-white {
    color: white;

    .ui-toolbar__body {
      border-color: rgba(white, 0.4);
    }
  }

  // ================================================
  // Progress positions
  // ================================================

  .ui-toolbar--progress-position-top {
    .ui-toolbar__progress {
      top: 0;
    }
  }

</style>
