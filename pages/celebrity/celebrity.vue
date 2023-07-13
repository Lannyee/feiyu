<template>
	<view class="page-container flex flex-column">
		<u-navbar :is-back="false" title="达人库" title-size="32" title-color="#333" z-index="99999"></u-navbar>

		<view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" name="platformName" :list="tabList" :current="tabCurrent" height="90" :active-item-style="{'color': '#f36e96', 'font-size': '40rpx'}" active-color="#f36e96" :bold="false" :show-bar="false" @change="changeTab"></u-tabs-swiper>
		</view>
		<view class="form-container flex flex-column-center" v-if="tabList.length > 0">
			<view :class="{'form-input': true, 'flex1': true, 'flex': true, 'flex-column-center': true, 'active': search.focus}">
				<u-icon custom-prefix="custom-icon" name="sousuo" class="icon"></u-icon>
				<u-input class="flex1" v-model="celebrity[swiperCurrent].requestParam.nickName" placeholder="请输入博主昵称" height="70" @focus="search.focus = true" @blur="search.focus = false" @confirm="confirmSearch" />
			</view>
			<button class="form-filter" @tap="requestFilter(swiperCurrent)">
				<u-icon custom-prefix="custom-icon" name="shaixuan" class="icon"></u-icon>
			</button>
		</view>
		<swiper ref="swiper" class="swiper-container flex1" :current="swiperCurrent" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(swiperItem, swiperIndex) in celebrity" :key="swiperIndex">
				<scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="swiperItem.refresher.triggered" class="scroll-view" @refresherrefresh="refresherSwiper(swiperIndex)" @scrolltolower="onreachBottom(swiperIndex)">
					<view class="banner-container" v-if="swiperItem.banner && swiperItem.isBannerRequest">
						<view class="banner">
							<u-image :src="swiperItem.banner" :show-error="false" width="100%" height="100%" mode="aspectFill"></u-image>
						</view>
					</view>

					<view class="list" v-if="swiperItem.resultList.length > 0">
						<view class="item flex flex-column-center" v-for="(item, index) in swiperItem.resultList" :key="index">
							<view class="item-picture">
								<u-image :src="item.headImg" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
							</view>
							<div class="item-content flex1">
								<view class="item-top flex flex-column-center flex-row-between">
									<view class="item-name flex1">{{ item.nickName }}</view>
									<!-- <view class="item-time">有效日期：{{ item.endTime || '暂无时间' }}</view> -->
								</view>
								<view class="item-index">博主指数：<text>{{ item.indexNum }}</text></view>
								<view class="item-fans">粉丝数：<text>{{ item.fansNum }}</text></view>
								<view class="item-price" v-for="(fieldItem, fieldIndex) in swiperItem.fieldList" :key="fieldIndex">{{ fieldItem.title }}：<text>{{ item[fieldItem.field] ? '￥' + item[fieldItem.field] : '暂无报价' }}</text></view>
							</div>
						</view>
					</view>

					<view class="list-default" v-if="swiperItem.load.isLoadOver && swiperItem.resultList.length == 0">
						<u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
						<view class="default-text">暂无数据</view>
					</view>

					<view class="loadmore" v-else>
						<u-loadmore :status="swiperItem.load.loadStatus" color="#aaa" icon-type="circle" :load-text="loadText" @loadmore="requestCelebrity(swiperIndex)" />
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<u-popup v-model="filter.isShowFilter" mode="right" width="70%">
			<view class="filter-container" v-for="(containerItem, containerIndex) in celebrity" :key="containerIndex" v-show="containerIndex == swiperCurrent" :style="{'padding-top': navbarHeight + 'px'}">
				<form class="filter-form" v-if="containerItem.filterList.length > 0" @reset="resetFilterForm(containerIndex)" @submit="submitFilterForm(containerIndex)">
					<scroll-view scroll-y class="filter-list">
						<view class="filter-item" v-for="(filterItem, filterIndex) in containerItem.filterList" :key="filterIndex">
							<view class="filter-title">{{ filterItem.searchName }}</view>
							<view class="filter-group flex flex-wrap">
								<view :class="{'item': true, 'active': item.isChecked}" @tap="changFilterItem(containerIndex, filterIndex, index)" v-for="(item, index) in filterItem.dataList" :key="index">{{ item.searchLabel }}</view>
							</view>
							<view class="filter-bottom" v-if="['priceScreen', 'fansScreen', 'areaScreen'].includes(filterItem.searchType)">
								<view class="filter-screen flex flex-column-center" v-if="['priceScreen', 'fansScreen'].includes(filterItem.searchType)">
									<input class="filter-input flex1" type="number" v-model="filterItem.screenValue.minValue" placeholder="最小值" placeholder-class="filter-input-placeholder" @blur="screenInputBlur(containerIndex, filterIndex)">
									<view class="filter-split">-</view>
									<input class="filter-input flex1" type="number" v-model="filterItem.screenValue.maxValue" placeholder="最大值" placeholder-class="filter-input-placeholder" @blur="screenInputBlur(containerIndex, filterIndex)">
								</view>
								<view :class="{'filter-region': true, 'active': filterItem.region.isChecked, 'disabled': !filterItem.region.cityName}" v-if="filterItem.searchType == 'areaScreen'" @tap="region = {containerIndex, filterIndex}">
									<picker mode="region" :value="[filterItem.region.provinceName, filterItem.region.cityName, filterItem.region.countyName]" @change="bindRegionChange">
										<view>{{ filterItem.region.cityName ? filterItem.region.provinceName + ' ' + filterItem.region.cityName : '请选择省市' }}</view>
									</picker>
								</view>
							</view>
						</view>
					</scroll-view>
					<view class="filter-button flex">
						<button form-type="reset">重置</button>
						<button form-type="submit">确认</button>
					</view>
				</form>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data: () => ({
			tabList: [
				{
					platformName: '小红书',
					platformId: '2',
					icon: '/static/images/platform/icon03.png',
				},
				{
					platformName: '抖音',
					platformId: '1',
					icon: '/static/images/platform/icon04.png',
				},
				{
					platformName: '微博',
					platformId: '4',
					icon: '/static/images/platform/icon05.png',
				},
				// {
				// 	platformName: '快手',
				// 	platformId: '5',
				// 	icon: '/static/images/platform/icon02.png',
				// },
				// {
				// 	platformName: '淘宝',
				// 	platformId: '3',
				// 	icon: '/static/images/platform/icon07.png',
				// },
				{
					platformName: 'B站',
					platformId: '7',
					icon: '/static/images/platform/icon06.png',
				}
			],
			tabCurrent: 0,
			swiperCurrent: 0,
			celebrity: [],
			search: {
				focus: false
			},
			filter: {
				isShowFilter: false
			},
			region: {
				containerIndex: 0,
				filterIndex: 0
			},
			loadText: {
				loadmore: '点击加载更多',
				loading: '努力加载中',
				nomore: '暂时没有更多了'
			},
			navbarHeight: 0
		}),
		onLoad() {
			this.$common.getNavbarHeight(navbarHeight => {
				this.navbarHeight = navbarHeight;
			});

			this.$common.getCustomer(this, () => {
				this.requestPlatformList(() => {
					this.requestOneBanner(this.swiperCurrent);
					this.requestCelebrity(this.swiperCurrent);
				});
			})
		},
		methods: {
			changeTab(index) {
				this.swiperCurrent = index;
			},
			animationfinish(e) {
				let current = e.detail.current;
				this.swiperCurrent = current;
				this.tabCurrent = current;
				this.requestOneBanner(current);
				if (!this.celebrity[current].load.isLoadOver) {
					this.requestCelebrity(current);
				}
			},
			onreachBottom(current) {
				this.requestCelebrity(current);
			},
			refresherSwiper(current) {
				if (!this.celebrity[current].refresher.triggered) {
					this.celebrity[current].refresher.triggered = true;
					this.reloadRequest(current);
					this.requestCelebrity(current, () => {
						setTimeout(() => {
							this.celebrity[current].refresher.triggered = false;
						}, 500);
					});
				}
			},
			requestPlatformList(callBack) {
				let index = 0;
				for (let item of this.tabList) {
					this.celebrity.push({
						index,
						platformId: item.platformId,
						platformName: item.platformName,
						resultList: [],
						fieldList: [],
						filterList: [],
						isFilterRequest: false,
						banner: '',
						isBannerRequest: false,
						page: {
							pageNum: 1,
							pageCount: 0
						},
						load: {
							isLoadOver: false,
							loadStatus: 'loadmore'
						},
						requestParam: {
							type: item.platformId,
							nickName: ''
						},
						refresher: {
							triggered: false,
							isClear: true
						}
					})
					index++;
				}

				callBack && callBack();
			},
			requestOneBanner(current) {
				if (!this.celebrity[current].isBannerRequest) {
					this.$u.post('/getOneBanner', {
						platformId: this.celebrity[current].platformId
					}).then(res => {
						this.celebrity[current].isBannerRequest = true;
						if (this.$common.isNotEmpty(res.data) && this.$common.isNotEmpty(res.data.imgPath)) {
							this.celebrity[current].banner = res.data.imgPath;
						}
					});
				}
			},
			requestCelebrity(current, callBack) {
				this.$common.requestResultRender(this, '/getCelebrityPageList', this.celebrity[current], item => {
					if (this.$common.isNumber(item.indexNum)) {
						item.indexNum = parseFloat(item.indexNum);
					} else {
						item.indexNum = '-';
					}
					if (this.$common.isNumber(item.fansNum)) {
						if (parseFloat(item.fansNum) == 0) {
							item.fansNum = 0;
						} else if (parseFloat(item.fansNum) < 1) {
							item.fansNum = parseFloat(parseFloat(item.fansNum) * 10000).toFixed(0);
						} else {
							item.fansNum = parseFloat(parseFloat(item.fansNum).toFixed(1)) + '万';
						}
					} else {
						item.fansNum = '-';
					}
					return item;
				}, callBack && callBack());
			},
			requestFilter(current) {
				this.filter.isShowFilter = true;
				if (!this.celebrity[current].isFilterRequest) {
					this.$u.post('/getCelebrityParam', {
						platformId: this.celebrity[current].platformId
					}).then(res => {
						this.celebrity[current].isFilterRequest = true;
						this.celebrity[current].filterList = [];
						if (this.$common.isNotEmpty(res.data)) {
							for (let item of res.data) {
								if (['priceScreen', 'fansScreen'].includes(item.searchType)) {
									item.screenValue = {
										minValue: '',
										maxValue: '',
										searchValue: ''
									}
								} else if (item.searchType == 'areaScreen') {
									item.region = {
										provinceName: '',
										cityName: '',
										countyName: '',
										isChecked: false
									}
								}
								if (this.$common.isNotEmpty(item.dataList) && item.dataList.length > 0) {
									for (let dataItem of item.dataList) {
										dataItem.isChecked = false;
									}
									this.celebrity[current].filterList.push(item);
								}
							}
						}
					});
				}
			},
			confirmSearch() {
				this.reloadRequest(this.swiperCurrent);
				this.requestCelebrity(this.swiperCurrent);
			},
			changFilterItem(containerIndex, filterIndex, index) {
				let dataList = this.celebrity[containerIndex].filterList[filterIndex].dataList;
				let searchType = this.celebrity[containerIndex].filterList[filterIndex].searchType;
				for (let i = 0; i < dataList.length; i++) {
					if (i != index) {
						dataList[i].isChecked = false;
					}
				}
				dataList[index].isChecked = !dataList[index].isChecked;
				if (searchType == 'areaScreen') {
					let region = this.celebrity[containerIndex].filterList[filterIndex].region;
					region.isChecked = false;
				} else if (['priceScreen', 'fansScreen'].includes(searchType)) {
					let screenValue = this.celebrity[containerIndex].filterList[filterIndex].screenValue;
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
			screenInputBlur(containerIndex, filterIndex) {
				let dataList = this.celebrity[containerIndex].filterList[filterIndex].dataList;
				let screenValue = this.celebrity[containerIndex].filterList[filterIndex].screenValue;
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
			bindRegionChange(e) {
				let region = this.celebrity[this.region.containerIndex].filterList[this.region.filterIndex].region;
				let dataList = this.celebrity[this.region.containerIndex].filterList[this.region.filterIndex].dataList;
				region.provinceName = e.detail.value[0];
				region.cityName = e.detail.value[1];
				region.countyName = e.detail.value[2];
				region.isChecked = true;
				for (let item of dataList) {
					item.isChecked = false;
				}
			},
			resetFilterForm(containerIndex) {
				let filterList = this.celebrity[containerIndex].filterList;
				for (let filterItem of filterList) {
					for (let item of filterItem.dataList) {
						item.isChecked = false;
					}
					if (filterItem.searchType == 'areaScreen') {
						let region = filterItem.region;
						region.isChecked = false;
						region.provinceName = '';
						region.cityName = '';
						region.countyName = '';
					} else if (['priceScreen', 'fansScreen'].includes(filterItem.searchType)) {
						let screenValue = filterItem.screenValue;
						screenValue.minValue = '';
						screenValue.maxValue = '';
						screenValue.searchValue = '';
					}
				}
			},
			submitFilterForm(containerIndex) {
				this.filter.isShowFilter = false;
				let filterList = this.celebrity[containerIndex].filterList;
				let filterData = {};
				for (let filterItem of filterList) {
					filterData[filterItem.searchType] = '';
					for (let item of filterItem.dataList) {
						if (item.isChecked) {
							filterData[filterItem.searchType] = item.searchValue;
						}
					}
					if (filterItem.searchType == 'areaScreen') {
						let region = filterItem.region;
						if (region.isChecked) {
							filterData[filterItem.searchType] = region.cityName;
						}
					} else if (['priceScreen', 'fansScreen'].includes(filterItem.searchType)) {
						let screenValue = filterItem.screenValue;
						filterData[filterItem.searchType] = screenValue.searchValue;
					}
				}
				this.reloadRequest(this.swiperCurrent);
				Object.assign(this.celebrity[this.swiperCurrent].requestParam, filterData);
				this.requestCelebrity(this.swiperCurrent);
			},
			reloadRequest(current) {
				this.celebrity[current].page = {
					pageNum: 1,
					pageCount: 0
				}
				this.celebrity[current].load = {
					isLoadOver: false,
					loadStatus: 'loadmore'
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/public.scss";
	
	.page-container {
		height: 100vh;
	}

	.swiper-tab {
		background: #fff;
		padding: 0 10rpx;
	}

	.swiper-container {
		box-sizing: border-box;
		.swiper-item {
			box-sizing: border-box;
		}
		.scroll-view {
			height: 100%;
			box-sizing: border-box;
		}
		.list {
			padding: 30rpx $space 0;
			.item {
				padding: 20rpx 25rpx;
				background: #fff;
				border-radius: 20rpx;
				&:nth-child(n+2) {
					margin-top: 25rpx;
				}
				.item-picture {
					width: 120rpx;
					height: 120rpx;
					margin-right: 25rpx;
				}
				.item-content {
					width: 0;
				}
				.item-top {
					margin-bottom: 5rpx;
				}
				.item-name {
					@include fontStyle;
					@include oneText;
				}
				.item-index,
				.item-fans,
				.item-price {
					@include fontStyle(#aaa, 24rpx);
					text {
						color: $color;
					}
				}
				.item-time {
					margin-left: 20rpx;
					@include fontStyle(#aaa, 20rpx);
				}
			}
		}
		.loadmore {
			padding: 30rpx 0;
		}
	}

	.form-container {
		padding: 10rpx $space 30rpx;
		background: #fff;
		.form-input {
			padding: 0 20rpx;
			border-radius: 70rpx;
			border: 1px solid #eee;
			&.active {
				border-color: $color;
				.icon {
					color: $color;
				}
			}
			.icon {
				margin-right: 15rpx;
				@include fontStyle(#c0c4cc, 36rpx, 70rpx);
			}
		}
		.form-filter {
			width: 70rpx;
			text-align: center;
			.icon {
				@include fontStyle($color, 44rpx, 70rpx);
			}
		}
	}

	.banner-container {
		padding: 30rpx $space 0;
		.banner {
			height: 250rpx;
			overflow: hidden;
			background: #fff;
			border-radius: 20rpx;
		}
		&~.list-default {
			padding: 200rpx 0;
		}
	}

	.filter-container {
		height: 100%;
		position: relative;
		.filter-form {
			height: 100%;
			display: block;
			padding-bottom: 120rpx;
			box-sizing: border-box;
		}
		.filter-list {
			height: 100%;
			box-sizing: border-box;
		}
		.filter-button {
			box-shadow: 0 -5rpx 15rpx rgba(#000, .05);
			padding: 25rpx 30rpx;
			position: absolute;
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
		.filter-region {
			width: calc((100% - 30rpx) / 2);
			padding: 0 15rpx;
			text-align: center;
			border-radius: 5rpx;
			border-radius: 60rpx;
			background: #f5f5f5;
			@include fontStyle(#333, 24rpx, 60rpx);
			@include muchText(1, 60rpx);
			&.active {
				color: #fff;
				background: $gradientColor;
			}
			&.disabled {
				color: #ccc;
			}
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