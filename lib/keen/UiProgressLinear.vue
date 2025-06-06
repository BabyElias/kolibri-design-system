<template>

    <transition name="ui-progress-linear--transition-fade">
      <div class="ui-progress-linear" :class="classes" :style="{ backgroundColor: progressBarColor }">
        <div
          v-if="type === 'determinate'"
          class="ui-progress-linear__progress-bar is-determinate"
  
          role="progressbar"
          :aria-valuemax="100"
          :aria-valuemin="0"
          :aria-valuenow="moderatedProgress"
  
          :style="{ 'transform': `scaleX(${moderatedProgress / 100})` }"
        ></div>
  
        <div
          v-else
          class="ui-progress-linear__progress-bar is-indeterminate"
  
          role="progressbar"
          :aria-valuemax="100"
  
          :aria-valuemin="0"
        ></div>
      </div>
    </transition>
  
  </template>
  
  <script>
  
    export default {
      name: 'UiProgressLinear',
  
      props: {
        type: {
          type: String,
          default: 'indeterminate', // 'determinate' or 'indeterminate'
        },
        color: {
          type: String,
          default: 'primary', // 'primary', 'accent', 'black' or 'white'
        },
        progress: {
          type: Number,
          default: 0,
        },
      },
  
      computed: {
        classes() {
          return [`ui-progress-linear--color-${this.color}`, `ui-progress-linear--type-${this.type}`];
        },
        progressBarColor() {
      if (this.color === "primary") {
        return this.$themeBrand?.primary?.v_600;
      }
    },
        moderatedProgress() {
          if (this.progress < 0) {
            return 0;
          }
  
          if (this.progress > 100) {
            return 100;
          }
  
          return this.progress;
        },
      },
    };
  
  </script>
  
  <style lang="scss">
  
    @import './styles/imports';
  
    $ui-progress-linear-height: rem(4px) !default;
  
    .ui-progress-linear {
      position: relative;
      display: block;
      width: 100%;
      height: $ui-progress-linear-height;
      overflow: hidden;
      transition-timing-function: ease;
      transition-duration: 0.3s;
      transition-property: height, opacity;
    }
  
    .ui-progress-linear__progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: $ui-progress-linear-height;
      transform-origin: left;
  
      &.is-determinate {
        transition: transform 0.2s ease;
      }
  
      &.is-indeterminate {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(0) scaleX(0);
        animation: ui-progress-linear-indeterminate 2.1s linear infinite;
      }
    }
  
    // ================================================
    // Animations
    // ================================================
  
    @keyframes ui-progress-linear-indeterminate {
      // First half: short in, long out
      0% {
        transform: translateX(0) scaleX(0);
      }
  
      25% {
        transform: translateX(50%) scaleX(0.6);
      }
  
      49% {
        transform: translateX(110%) scaleX(0);
      }
  
      // Second half: long in, short out
      50% {
        transform: translateX(0) scaleX(0);
      }
  
      75% {
        transform: translateX(0) scaleX(0.6);
      }
  
      100% {
        transform: translateX(110%) scaleX(0);
      }
    }
  
    // ================================================
    // Toggle transition
    // ================================================
  
    .ui-progress-linear--transition-fade-enter-active,
    .ui-progress-linear--transition-fade-leave-active {
      transition: opacity 0.3s ease;
    }
  
    .ui-progress-linear--transition-fade-enter,
    .ui-progress-linear--transition-fade-leave-active {
      opacity: 0;
    }
  
    // ================================================
    // Colors
    // ================================================
  
    
  
    .ui-progress-linear--color-accent {
      background-color: rgba($brand-accent-color, 0.4);
  
      .ui-progress-linear__progress-bar {
        background-color: $brand-accent-color;
      }
    }
  
    .ui-progress-linear--color-black {
      background-color: rgba($md-grey-700, 0.4);
  
      .ui-progress-linear__progress-bar {
        background-color: $md-grey-700;
      }
    }
  
    .ui-progress-linear--color-white {
      background-color: rgba(white, 0.4);
  
      .ui-progress-linear__progress-bar {
        background-color: white;
      }
    }
  
  </style>
  