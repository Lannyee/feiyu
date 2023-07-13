<template>
	<view class="page-container flex flex-column">
		<u-navbar :is-back="false" title="首页" :background="{background: '#f36e96'}" title-size="32" title-color="#fff" z-index="99999" :border-bottom="false">
			<view class="navbar">
				<button class="navbar-picture" @tap="userInfo.id ? $u.route({url: '/pages/customer/customer', type: 'tab'}) : $u.route('/pages/login/login')">
					<u-image :src="userInfo.headImg || '/static/images/user1.png'" width="100%" height="100%" mode="aspectFill" shape="circle" :show-loading="false"></u-image>
				</button>
			</view>
		</u-navbar>

		<!-- 使用swiper组件解决自定义导航栏下拉刷新在IOS上的兼容问题 -->
		<swiper class="swiper-container flex1">
			<swiper-item class="swiper-item">
				<scroll-view class="scroll-view" scroll-y :scroll-top="scrollTop" :refresher-enabled="true" refresher-default-style="white" refresher-background="#f36e96" :refresher-triggered="goods.refresher.triggered" @scroll="containerScroll" @refresherrefresh="refresherGoods" @scrolltolower="onreachBottom">
					<view class="form-container flex flex-column-center">
						<view class="form-input flex1 flex flex-column-center">
							<u-icon custom-prefix="custom-icon" name="sousuo" class="icon"></u-icon>
							<u-input :disabled="true" class="flex1" type="type" placeholder="请输入商品名称" height="70" />
							<button @tap="$u.route('/pages/goodsSearch/search')"></button>
						</view>
						<button class="form-filter" @tap="$u.route('/pages/goodsSearch/filter')">
							<u-icon custom-prefix="custom-icon" name="shaixuan" class="icon"></u-icon>
						</button>
					</view>
					
					<view class="banner-container">
						<view class="swiper-container">
							<u-swiper :list="bannerList" @click="bannerClick" bg-color="#fff" height="250" mode="round" interval="5000" border-radius="20"></u-swiper>
						</view>
					</view>
					
					<view class="goods-container">
						<view class="goods-list flex flex-wrap" v-if="goods.resultList.length > 0">
							<button v-for="(item, index) in goods.resultList" :key="index" :class="{'item': true, 'disabled': item.goodsStatus == '4'}" @tap="toGoodsDetail(item)">
								<view class="item-picture">
									<u-image class="picture-container" :src="item.imgThumbnail" width="100%" mode="widthFix">
										<u-loading slot="loading"></u-loading>
									</u-image>
									<view class="picture-title" v-if="item.rewardStr">{{ item.rewardStr }}</view>
									<view class="picture-disabled flex-center" v-if="item.goodsStatus == '4'">
										<image src="@/static/images/img02.png" mode="aspectFit"></image>
									</view>
								</view>
								<view class="item-content">
									<view class="item-title flex flex-column-center">
										<image class="platform-icon" :src="item.platformIcon" mode="aspectFill"></image>
										<text class="platform-text flex1">{{ item.goodsName }}</text>
									</view>
									<view class="item-info flex flex-column-center flex-row-between">
										<view class="item-price">
											<text>￥{{ item.currentPrice }}</text>
										</view>
										<view class="item-number">
											数量：<text>{{ item.applyNum }}</text>份
										</view>
									</view>
									<view class="item-time">
										活动时间：<text>{{ item.validityTerm }}</text>
									</view>
									<view class="item-bottom flex flex-column-center flex-row-between">
										<view class="item-number">
											申请人数：<text>{{ item.appliedNum + item.basisApplyNum }}</text>
										</view>
										<view :class="{'item-button': true, 'disabled': (item.goodsStatus == '4' || item.goodsStatus == '5')}">{{ item.goodsStatus == '4' ? '已结束' : item.goodsStatus == '5' ? '已申请' : '立即申请' }}</view>
									</view>
								</view>
							</button>
						</view>
						<view class="loadmore">
							<u-loadmore :status="goods.load.loadStatus" color="#aaa" icon-type="circle" :load-text="loadText" @loadmore="requestGoods" />
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<view class="goTop" v-if="containerTop > 400" @tap="goTop">
			<u-icon name="arrow-up"></u-icon>
		</view>
	</view>
</template>

<script>
	export default {
		data: () => ({
			scrollTop: 0,
			containerTop: 0,
			userInfo: {},
			bannerList: [],
			goods: {
				resultList: [],
				page: {
					pageNum: 1,
					pageCount: 0
				},
				load: {
					isLoadOver: false,
					loadStatus: 'loadmore'
				},
				requestParam: {
					goodsSource: 3
				},
				refresher: {
					triggered: false,
					isClear: false
				}
			},
			loadText: {
				loadmore: '点击加载更多',
				loading: '努力加载中',
				nomore: '暂时没有更多了'
			}
		}),
		onLoad() {
			this.requestBanner();
		},
		onShow() {
			this.$common.getCustomer(this, data => {
				this.$common.renderTabBarBadgeCustomer(data);
				if (this.$common.isNotEmpty(data)) {
					this.userInfo = data;
					if (this.userInfo.guideStatus != '1') {
						this.$u.route('/pages/guide/step');
					}
				} else {
					this.userInfo = {};
				}
				if (!this.goods.load.isLoadOver) {
					this.requestGoods();
				}
			})

			let changeGoods = uni.getStorageSync('changeGoods');
			if (this.$common.isNotEmpty(changeGoods)) {
				uni.removeStorageSync('changeGoods');
				for (let $item of changeGoods) {
					for (let item of this.goods.resultList) {
						if (item.goodsId == $item.goodsId) {
							item.goodsStatus = $item.goodsStatus;
							break;
						}
					}
				}
			}
		},
		methods: {
			containerScroll(e) {
				this.containerTop = e.detail.scrollTop;
			},
			goTop() {
				this.scrollTop = this.containerTop;
				this.containerTop = 0;
				this.$nextTick(() => {
					this.scrollTop = 0;
				})
			},
			onreachBottom() {
				this.requestGoods();
			},
			refresherGoods() {
				if (!this.goods.refresher.triggered) {
					this.goods.refresher.triggered = true;
					this.goods.page = {
						pageNum: 1,
						pageCount: 0
					}
					this.goods.load = {
						isLoadOver: false,
						loadStatus: 'loadmore'
					}
					this.requestGoods(() => {
						setTimeout(() => {
							this.goods.refresher.triggered = false;
						}, 500);
					});
				}
			},
			requestGoods(callBack) {
				this.$common.requestResultRender(this, '/getGoodsList', this.goods, item => {
					item.platformIcon = this.$common.getPlatformLogo(item.label);
					return item;
				}, callBack && callBack());
			},
			requestBanner() {
				this.isLoadBanner = true;
				this.$u.post('/getBannerList', {
					showPosition: 2
				}).then(res => {
					for (let item of res.data) {
						this.bannerList.push({
							image: item.imgPath,
							href: item.urlPath
						})
					}
				});
			},
			toGoodsDetail(item) {
				// goodsSource 商品来源(1: 兑换商品, 2: 卡片, 3: 试用商品)
				this.$u.route('/pages/applyGoods/goodsDetail', {
					goodsId: item.goodsId,
					brandId: item.brandId,
					goodsSource: 3
				});
			},
			bannerClick(index) {
				let url = this.bannerList[index].href;
				if (this.$common.isNotEmpty(url)) {
					let type = this.$common.getRouteType(url);
					let param = url.split('?')[1];
					let params = {};
					if (this.$common.isNotEmpty(param)) {
						let paramList = param.split('&');
						for (let item of paramList) {
							let key = item.split('=')[0];
							let value = item.split('=')[1];
							params[key] = value;
						}
					}
					this.$u.route({
						url,
						type,
						params
					});
				}
			},
			onShareAppMessage() {
				return {
					title: '百万好物免费试用',
					imageUrl: 'https://feiyudata.com/profile/banner/2021/12/08/56581ca316fa5fafdabf74892f99f046.png',
					path: '/pages/home/home'
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "@/public.scss";
	
	.page-container {
		height: 100vh;
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
	}
	
	.form-container {
		padding: 20rpx $space;
		background: $color;
		.form-input {
			overflow: hidden;
			padding: 0 20rpx;
			position: relative;
			background: #fff;
			border-radius: 70rpx;
			.icon {
				margin-right: 15rpx;
				@include fontStyle(#bbb, 36rpx);
			}
			button {
				@include positionCenter;
				border-radius: 70rpx;
				z-index: 5;
				opacity: 0;
			}
		}
		.form-filter {
			width: 70rpx;
			text-align: center;
			.icon {
				@include fontStyle(#fff, 44rpx, 70rpx);
			}
		}
	}
	
	.banner-container {
		position: relative;
		background: $color;
		padding: 0 $space;
		&::after {
			content: '';
			position: absolute;
			z-index: 5;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			height: 30rpx;
			background: $backgroundColor;
		}
		.swiper-container {
			position: relative;
			z-index: 10;
		}
	}

	.goods-container {
		padding: 30rpx $space;
		.goods-list {
			.item {
				width: calc((100% - 25rpx) / 2);
				overflow: hidden;
				position: relative;
				background: #fff;
				border-radius: 20rpx;
				&:not(:nth-child(2n-1)) {
					margin-left: 25rpx;
				}
				&:nth-child(n+3) {
					margin-top: 25rpx;
				}
				&.disabled {
					.item-picture {
						.picture-container {
							@include filterGrayscale(50%);
						}
					}
					.item-content {
						.item-button {
							background: $disabledColor;
						}
					}
				}
				.item-picture {
					overflow: hidden;
					position: relative;
					padding-top: 100%;
					.picture-container {
						position: absolute;
						margin: auto;
						width: 100%;
						right: 0;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
					}
					.picture-title {
						max-width: 85%;
						position: absolute;
						z-index: 5;
						bottom: 0;
						left: 0;
						padding: 5rpx 15rpx;
						background: $gradientColor;
						border-radius: 0 20rpx 0 0;
						@include fontStyle(#fff, 24rpx);
						@include oneText;
					}
					.picture-disabled {
						z-index: 10;
						background: rgba(#000, .5);
						@include positionCenter;
						image {
							width: 70%;
							height: 70%;
						}
					}
				}
				.item-content {
					padding: 20rpx;
					.item-title {
						.platform-text {
							width: 0;
							text-align: left;
							@include fontStyle;
							@include muchText(1, 40rpx);
						}
					}
					.item-info {
						margin-top: 15rpx;
					}
					.item-price {
						font-weight: bold;
						@include fontStyle($color, 32rpx);
					}
					.item-number {
						@include fontStyle(#666, 22rpx);
						text {
							color: $color;
						}
					}
					.item-time {
						margin-top: 10rpx;
						text-align: left;
						@include fontStyle(#aaa, 18rpx);
					}
					.item-bottom {
						margin-top: 10rpx;
					}
					.item-button {
						width: 130rpx;
						text-align: center;
						border-radius: 44rpx;
						@include backgroundGradientColor;
						@include fontStyle(#fff, 22rpx, 44rpx);
						&.disabled {
							background: $disabledColor;
						}
					}
				}
			}
			&+.loadmore {
				margin-top: 30rpx;
			}
		}
	}
</style>