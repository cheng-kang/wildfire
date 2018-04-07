<template>
  <div :class="itemClasses">
    <div :class="headerClasses" @click="toggle">
      <Icon type="arrow-right-b"></Icon>
      <slot></slot>
      <span v-if="$slots.extra" :class="headerExtraClass" @click.stop>
        <slot name="extra" ></slot>
      </span>
    </div>
    <collapse-transition>
      <div :class="contentClasses" v-show="isActive">
        <div :class="boxClasses"><slot name="content"></slot></div>
      </div>
    </collapse-transition>
  </div>
</template>
<script>
import Icon from 'iview/src/components/icon/icon.vue'
import CollapseTransition from 'iview/src/components/base/collapse-transition'

const prefixCls = 'ivu-collapse'

export default {
	name: 'Panel',
	components: { Icon, CollapseTransition },
	props: {
		name: {
			type: String,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			index: 0, // use index for default when name is null
			isActive: false,
		}
	},
	computed: {
		itemClasses() {
			return [
				`${prefixCls}-item`,
				{
					[`${prefixCls}-item-active`]: this.isActive,
				},
			]
		},
		headerClasses() {
			return `${prefixCls}-header`
		},
		headerExtraClass() {
			return `${prefixCls}-header-extra`
		},
		contentClasses() {
			return `${prefixCls}-content`
		},
		boxClasses() {
			return `${prefixCls}-content-box`
		},
	},
	methods: {
		toggle() {
			if (this.disabled) return
			this.$parent.toggle({
				name: this.name || this.index,
				isActive: this.isActive,
			})
		},
		stopToggle() {
			return true
		},
	},
}
</script>
