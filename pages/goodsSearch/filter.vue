<template>
	<view class="page-container flex flex-column">
		<u-navbar :is-back="false" title="筛选" title-size="32" title-color="#333" z-index="99999">
			<view class="navbar">
				<view class="navbar-crumbs flex flex-column-center">
					<button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
					<view class="split-line"></view>
					<button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
				</view>
			</view>
		</u-navbar>

		<view class="filter-container flex1" v-if="filter.length > 0">
			<scroll-view scroll-y class="scroll-view">
				<form class="filter-form" @reset="resetFilterForm" @submit="submitFilterForm">
					<view class="filter-list">
						<view class="filter-item" v-for="(filterItem, filterIndex) in filter" :key="filterIndex">
							<view class="filter-title">{{ filterItem.searchName }}</view>
							<view class="filter-group flex flex-wrap">
								<view :class="{'item': true, 'active': item.isChecked}" @tap="changFilterItem(filterIndex, index)" v-for="(item, index) in filterItem.searchList" :key="index">{{ item.searchName }}</view>
							</view>
							<view class="filter-bottom" v-if="['priceScreen'].includes(filterItem.searchValue)">
								<view class="filter-screen flex flex-column-center" v-if="['priceScreen'].includes(filterItem.searchValue)">
									<input class="filter-input flex1" type="number" v-model="filterItem.screenValue.minValue" placeholder="最小值" placeholder-class="filter-input-placeholder" @blur="screenInputBlur(filterIndex)">
									<view class="filter-split">-</view>
									<input class="filter-input flex1" type="number" v-model="filterItem.screenValue.maxValue" placeholder="最大值" placeholder-class="filter-input-placeholder" @blur="screenInputBlur(filterIndex)">
								</view>
							</view>
						</view>
					</view>
					<view class="filter-button flex">
						<button form-type="reset">重置</button>
						<button form-type="submit">确认</button>
					</view>
				</form>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data: () => ({
			goodsName: '',
			filter: []
		}),
		onLoad() {
			this.requestFilter();
		},
		onShow() {
			
		},
		methods: {
			requestFilter() {
				this.$u.post('/getSearchList').then(res => {
					if (this.$common.isNotEmpty(res.data)) {
						for (let item of res.data) {
							if (['priceScreen'].includes(item.searchValue)) {
								item.screenValue = {
									minValue: '',
									maxValue: '',
									searchValue: ''
								}
							}
							if (this.$common.isNotEmpty(item.searchList) && item.searchList.length > 0) {
								for (let dataItem of item.searchList) {
									dataItem.isChecked = false;
								}
								this.filter.push(item);
							}
						}
					}
				});
			},
			confirmSearch() {
				if (this.$common.isNotEmpty(this.goodsName)) {
					let historySearch = uni.getStorageSync('historySearch');
					if (this.$common.isNotEmpty(historySearch)) {
						if (!historySearch.includes(this.goodsName)) {
							historySearch.unshift(this.goodsName);
						}
					} else {
						historySearch = [this.goodsName];
					}
					uni.setStorageSync('historySearch', historySearch);

					this.submitFilterForm();
				}
			},
			changFilterItem(filterIndex, index) {
				let dataList = this.filter[filterIndex].searchList;
				let searchType = this.filter[filterIndex].searchValue;
				for (let i = 0; i < dataList.length; i++) {
					if (i != index) {
						dataList[i].isChecked = false;
					}
				}
				dataList[index].isChecked = !dataList[index].isChecked;
				if (['priceScreen'].includes(searchType)) {
					let screenValue = this.filter[filterIndex].screenValue;
					if (dataList[index].isChecked) {
						let searchValue = dataList[index].searchValue;
						if (this.$common.isNumber(searchValue.split('-')[0])) {
							screenValue.minValue = parseFloat(searchValue.split('-')[0]);
						} else {
							screenValue.minValue = '';
						}
						if (this.$common.isNumber(searchValue.split('-')[1])) {
							screenValue.maxValue = parseFloat(searchValue.split('-')[1]);
						} else {
							screenValue.maxValue = '';
						}
						screenValue.searchValue = searchValue;
					} else {
						screenValue.minValue = '';
						screenValue.maxValue = '';
						screenValue.searchValue = '';
					}
				}
			},
			screenInputBlur(filterIndex) {
				let dataList = this.filter[filterIndex].searchList;
				let screenValue = this.filter[filterIndex].screenValue;
				if (this.$common.isNumber(screenValue.minValue)) {
					screenValue.minValue = Math.abs(parseFloat(screenValue.minValue).toFixed(0));
				} else {
					screenValue.minValue = '';
				}
				if (this.$common.isNumber(screenValue.maxValue)) {
					screenValue.maxValue = Math.abs(parseFloat(screenValue.maxValue).toFixed(0));
				} else {
					screenValue.maxValue = '';
				}
				if (this.$common.isNumber(screenValue.minValue)) {
					if (this.$common.isNumber(screenValue.maxValue)) {
						if (screenValue.maxValue < screenValue.minValue) {
							let exchangeValue = screenValue.maxValue;
							screenValue.maxValue = screenValue.minValue;
							screenValue.minValue = exchangeValue;
						}
						screenValue.searchValue = screenValue.minValue + '-' + screenValue.maxValue;
					} else {
						screenValue.searchValue = screenValue.minValue;
					}
				} else {
					if (this.$common.isNumber(screenValue.maxValue)) {
						screenValue.minValue = 0;
						screenValue.searchValue = screenValue.minValue + '-' + screenValue.maxValue;
					}
				}
				for (let item of dataList) {
					item.isChecked = false;
					if (item.searchValue == screenValue.searchValue) {
						item.isChecked = true;
					}
				}
			},
			resetFilterForm() {
				this.goodsName = '';
				for (let filterItem of this.filter) {
					for (let item of filterItem.searchList) {
						item.isChecked = false;
					}
					if (['priceScreen'].includes(filterItem.searchValue)) {
						let screenValue = filterItem.screenValue;
						screenValue.minValue = '';
						screenValue.maxValue = '';
						screenValue.searchValue = '';
					}
				}
			},
			submitFilterForm() {
				let filterData = {};
				for (let filterItem of this.filter) {
					filterData[filterItem.searchValue] = '';
					for (let item of filterItem.searchList) {
						if (item.isChecked) {
							filterData[filterItem.searchValue] = item.searchValue;
						}
					}
					if (['priceScreen'].includes(filterItem.searchValue)) {
						let screenValue = filterItem.screenValue;
						filterData[filterItem.searchValue] = screenValue.searchValue;
					}
				}
				
				this.toResult(JSON.stringify(filterData));
			},
			toResult(filterData) {
				this.$u.route('/pages/goodsSearch/result', {
					goodsName: this.goodsName,
					filterData
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
	.page-container {
		height: 100vh;
		background: #fff;
	}

	.form-container {
		padding: 30rpx $space;
		.form-input {
			overflow: hidden;
			padding: 0 20rpx;
			position: relative;
			border-radius: 70rpx;
			background: #f2f2f2;
			.icon {
				margin-right: 15rpx;
				@include fontStyle(#aaa, 36rpx);
			}
		}
		.form-cancel {
			width: 70rpx;
			text-align: right;
			@include fontStyle(#666, 28rpx, 70rpx);
		}
	}

	.filter-container {
		overflow: hidden;
		.scroll-view {
			height: 100%;
			box-sizing: border-box;
			padding-bottom: 120rpx;
		}
		.filter-form {
			display: block;
			box-sizing: border-box;
		}
		.filter-button {
			box-shadow: 0 -5rpx 15rpx rgba(#000, .05);
			padding: 25rpx 30rpx;
			position: fixed;
			z-index: 10;
			width: 100%;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			background: #fff;
			button {
				height: 70rpx;
				background: #eee;
				border-radius: 70rpx;
				width: calc(50% - 15rpx);
				@include fontStyle(#999, 30rpx, 70rpx);
				&:nth-child(2) {
					color: #fff;
					margin-left: 30rpx;
					background: $gradientColor;
				}
			}
		}
		.filter-item {
			padding: 25rpx 30rpx 30rpx;
			&:nth-child(n+2) {
				border-top: 1px solid #eee;
			}
			.filter-title {
				@include fontStyle;
			}
			.filter-group {
				margin-top: 20rpx;
				.item {
					box-sizing: border-box;
					background: #f5f5f5;
					padding: 0 10rpx;
					text-align: center;
					border-radius: 5rpx;
					width: calc((100% - 30rpx) / 3);
					@include fontStyle(#333, 24rpx, 60rpx);
					@include oneText;
					&:not(:nth-child(3n-2)) {
						margin-left: 15rpx;
					}
					&:nth-child(n+4) {
						margin-top: 15rpx;
					}
					&.active {
						color: #fff;
						background: $gradientColor;
					}
				}
			}
		}
		.filter-bottom {
			margin-top: 20rpx;
		}
		.filter-input {
			height: 60rpx;
			padding: 0 15rpx;
			text-align: center;
			border-radius: 60rpx;
			background: #f5f5f5;
			@include fontStyle(#333, 24rpx);
		}
		/deep/.filter-input-placeholder {
			color: #ccc;
		}
		.filter-split {
			width: 30rpx;
			text-align: center;
			@include fontStyle(#ccc, 26rpx, 60rpx);
		}
	}
</style>