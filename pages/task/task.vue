<template>
	<view class="page-container flex flex-column">
		<u-navbar :is-back="false" title="每日任务" title-size="32" title-color="#333" z-index="99999"></u-navbar>

		<view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" :list="tabList" :current="tabCurrent" height="90" :active-item-style="{'color': '#f36e96', 'font-size': '40rpx'}" active-color="#f36e96" :bold="false" :show-bar="false" @change="changeTab"></u-tabs-swiper>
		</view>
		<swiper ref="swiper" class="swiper-container flex1" :current="swiperCurrent" @animationfinish="animationfinish">
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view" :refresher-enabled="true" :refresher-triggered="tabList[0].triggered" @refresherrefresh="refresherSwiper(0)">
					<view class="task-container">
						<view class="task-top">
							<view class="task-picture">
								<u-image :src="taskBanner" :show-error="false" width="100%" height="100%" mode="aspectFill"></u-image>
							</view>
							<button class="button-series"><text>已连续签到{{ taskSign.signDays || 0 }}天</text></button>
							<button class="button-rule" @tap="toRule('sign', '签到规则')"><text>查看规则</text></button>
							<button class="button-sign flex-center" @tap="doSign">
								<u-icon class="icon" custom-prefix="custom-icon" name="qiandao-xianxing"></u-icon>
								<text>{{ taskSign.isSigned ? '已签到' : '立即签到'}}</text>
							</button>
						</view>
						<view class="task-list" v-if="taskTyroList.length > 0">
							<view class="list-top flex flex-column-center flex-row-between">
								<view class="list-title">新手任务</view>
								<button class="list-button flex-center" hover-class="active" @tap="toRule('newbie_task', '新手任务')">
									<text>任务规则</text>
									<u-icon class="icon" name="question-circle"></u-icon>
								</button>
							</view>
							<view class="list">
								<view class="item flex flex-column-center flex-row-between" v-for="(item, index) in taskTyroList" :key="index">
									<view class="item-picture">
										<u-image :src="item.taskIcon" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
									</view>
									<view class="item-content flex1">
										<view class="content-title">{{ item.taskName }}</view>
										<view class="content-detail flex flex-column-center">
											<u-icon class="icon" name="checkmark-circle-fill"></u-icon>
											<text>{{ item.taskDescribe }}</text>
										</view>
									</view>
									<button class="item-button" @tap="doTasks(item)" :disabled="item.taskStatus">{{ item.btnType == '2' ? '查看规则' : item.btnType == '1' ? (item.taskStatus ? '已完成' : '去做任务') : '去做任务' }}</button>
								</view>
							</view>
						</view>
						<view class="task-list" v-if="taskDailyList.length > 0">
							<view class="list-top flex flex-column-center flex-row-between">
								<view class="list-title">每日任务</view>
								<button class="list-button flex-center" hover-class="active" @tap="toRule('daily_task', '每日任务')">
									<text>任务规则</text>
									<u-icon class="icon" name="question-circle"></u-icon>
								</button>
							</view>
							<view class="list">
								<view class="item flex flex-column-center flex-row-between" v-for="(item, index) in taskDailyList" :key="index">
									<view class="item-picture">
										<u-image :src="item.taskIcon" border-radius="50%" width="100%" height="100%" mode="aspectFill"></u-image>
									</view>
									<view class="item-content flex1">
										<view class="content-title">{{ item.taskName }}</view>
										<view class="content-detail flex flex-column-center">
											<u-icon class="icon" name="checkmark-circle-fill"></u-icon>
											<text>{{ item.taskDescribe }}</text>
										</view>
									</view>
									<button class="item-button" @tap="doTasks(item)" :disabled="item.taskStatus">{{ item.btnType == '2' ? '查看规则' : item.btnType == '1' ? (item.taskStatus ? '已完成' : '去做任务') : '去做任务' }}</button>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view" :refresher-enabled="true" :refresher-triggered="tabList[1].triggered" @refresherrefresh="refresherSwiper(1)" @scrolltolower="onreachBottom('lotteryGoods')">
					<view class="lottery-container">
						<view class="lottery-banner">
							<u-swiper :list="lotteryBanner" border-radius="0" bg-color="#fff" height="360" :mode="lotteryBanner.length > 1 ? 'round' : 'none'" interval="5000"></u-swiper>
						</view>
						<view class="lottery-list">
							<view class="list-top flex flex-column-center flex-row-between">
								<view class="list-title">我的奖券</view>
								<button class="list-button flex-center" hover-class="active" @tap="toPage('/account/card')">
									<text>查看奖券明细</text>
									<u-icon class="icon" name="arrow-right"></u-icon>
								</button>
							</view>
							<view class="list list-card flex">
								<view class="item flex1">
									<view class="item-title">{{ lotteryCardAll.length }}<text>张</text></view>
									<view class="item-content">当前奖券数量</view>
								</view>
								<view class="item flex1">
									<view class="item-title">{{ lotteryCardCan.length }}<text>次</text></view>
									<view class="item-content">可抽奖次数</view>
								</view>
							</view>
						</view>
						<view class="lottery-list">
							<view class="list-top flex flex-column-center flex-row-between">
								<view class="list-title">摸一摸</view>
								<button class="list-button flex-center" hover-class="active" @tap="toRule('lottery', '抽奖规则')">
									<text>活动规则</text>
									<u-icon class="icon" name="arrow-right"></u-icon>
								</button>
							</view>
							<view class="list list-draw">
								<view class="item flex flex-column-center flex-row-between">
									<view class="draw-content">消费奖券即可参与抽奖</view>
									<button class="draw-button" @tap="toLottery">参与抽奖</button>
								</view>
							</view>
						</view>
						<view class="lottery-list" v-if="lotteryGoods.load.isLoadOver">
							<view class="list-top flex flex-column-center flex-row-between">
								<view class="list-title">袋子<text>(当前可抽商品)</text></view>
								<button class="list-button flex-center" hover-class="active" @tap="toPage('/lottery/record')">
									<text>中奖记录</text>
									<u-icon class="icon" name="arrow-right"></u-icon>
								</button>
							</view>
							<view class="list list-goods">
								<view class="item flex flex-column-center" v-for="(item, index) in lotteryGoods.resultList" :key="index">
									<view class="item-picture">
										<u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
									</view>
									<view class="item-right flex1">
										<view class="item-title">{{ item.goodsName }}</view>
										<view class="item-price">价格：<text>￥{{ item.currentPrice }}</text></view>
									</view>
								</view>
							</view>
							<view class="list-default" v-if="lotteryGoods.load.isLoadOver && lotteryGoods.resultList.length == 0">
								<u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
								<view class="default-text">暂无数据</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item class="swiper-item">
				<scroll-view scroll-y class="scroll-view" :refresher-enabled="true" :refresher-triggered="tabList[2].triggered" @refresherrefresh="refresherSwiper(2)" @scrolltolower="onreachBottom('cashGoods')">
					<view class="cash-container">
						<view class="cash-top">
							<view class="cash-background"></view>
							<view class="cash-rule flex flex-column-center" @tap="toRule('exchange', '好物榜兑换说明')">
								<text class="rule-text">好物榜兑换说明</text>
								<u-icon class="rule-icon" name="question-circle"></u-icon>
							</view>
							<view class="cash-userInfo">
								<view class="flex flex-row-center">
									<button @tap="!isLogin && toPage('/lottery/record')">
										<view class="userInfo-picture">
											<u-image :src="userInfo.headImg || '/static/images/user.png'" bg-color="#fff" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
										</view>
										<view class="userInfo-username">{{ userInfo.nickName || '未登录' }}</view>
									</button>
								</view>
								<view class="userInfo-account flex">
									<view class="account-money flex1" @tap="isLogin && toPage('/account/money')">
										<view class="account-number">{{ parseFloat(userInfo.money) || 0 }}</view>
										<view class="account-title">可用鱼币</view>
									</view>
									<view class="account-credit flex1" @tap="isLogin && toPage('/account/credit')">
										<view class="account-number">{{ parseFloat(userInfo.integral) || 0 }}</view>
										<view class="account-title">可用蟹币</view>
									</view>
								</view>
							</view>
						</view>
						<view class="cash-list" v-if="cashGoods.load.isLoadOver">
							<view class="list">
								<button class="item flex flex-column-center" v-for="(item, index) in cashGoods.resultList" :key="index" @tap="toGoodsDetail(item)">
									<view class="item-picture">
										<u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
									</view>
									<view class="item-right flex1">
										<view class="item-title">{{ item.goodsName }}</view>
										<view class="item-price">
											<view class="item-number">价格：<text>￥{{ item.currentPrice }}</text></view>
										</view>
										<view class="item-cash flex flex-row-between flex-column-center">
											<view class="item-number">已兑换：<text>{{ item.soldNum }}</text></view>
											<view class="item-button">立即兑换</view>
										</view>
									</view>
								</button>
							</view>
							<view class="list-default" v-if="cashGoods.load.isLoadOver && cashGoods.resultList.length == 0">
								<u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
								<view class="default-text">暂无数据</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data: () => ({
			tabList: [
				{
					name: '任务中心',
					triggered: false
				},
				{
					name: '百宝袋',
					triggered: false
				},
				{
					name: '好物榜',
					triggered: false
				}
			],
			tabCurrent: 0,
			swiperCurrent: 0,
			isLogin: false,
			userInfo: {},
			taskBanner: '',
			taskSign: {},
			isTaskLoadOver: false,
			taskTyroList: [],
			taskDailyList: [],
			lotteryBanner: [],
			lotteryCard: {
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
					pageSize: 99999
				},
				refresher: {
					isClear: true
				}
			},
			lotteryCardAll: [],
			lotteryCardCan: [],
			lotteryGoods: {
				resultList: [],
				page: {
					pageNum: 1,
					pageCount: 0
				},
				load: {
					isLoadOver: false,
					loadStatus: 'loadmore'
				},
				requestParam: {},
				refresher: {
					isClear: false
				}
			},
			cashGoods: {
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
					goodsSource: '1'
				},
				refresher: {
					isClear: false
				}
			}
		}),
		onLoad(data) {
			if (data.index > 0) {
				this.tabCurrent = data.index;
				this.swiperCurrent = data.index;
			}
		},
		onShow() {
			this.showSwiper(this.swiperCurrent);
		},
		methods: {
			changeTab(index) {
				this.swiperCurrent = index;
			},
			animationfinish(e) {
				let current = e.detail.current;
				this.swiperCurrent = current;
				this.tabCurrent = current;
				this.showSwiper(current);
			},
			onreachBottom(type) {
				if (type == 'lotteryGoods') {
					this.requestLotteryGoods();
				} else if (type == 'cashGoods') {
					this.requestCashGoods();
				}
			},
			showSwiper(current) {
				this.$common.getCustomer(this, data => {
					this.$common.renderTabBarBadgeCustomer(data);
					this.isLogin = false;
					this.userInfo = {};
					if (this.$common.isNotEmpty(data)) {
						this.isLogin = true;
						this.userInfo = data;
					}
					if (current == 0) {
						this.requestOneBanner();
						this.requestSignDay();
						this.requestTask();
					} else if (current == 1) {
						this.requestBannerList();
						this.requestLotteryCard();
						if (!this.lotteryGoods.load.isLoadOver) {
							this.requestLotteryGoods();
						}
					} else if (current == 2) {
						if (!this.cashGoods.load.isLoadOver) {
							this.requestCashGoods();
						}
					}
				});
			},
			refresherSwiper(current) {
				if (!this.tabList[current].triggered) {
					this.tabList[current].triggered = true;
					if (current == 0) {
						this.isTaskLoadOver = false;
						this.requestTask(() => {
							setTimeout(() => {
								this.tabList[current].triggered = false;
							}, 500);
						});
					} else if (current == 1) {
						this.requestLotteryCard();
						this.lotteryGoods.page = {
							pageNum: 1,
							pageCount: 0
						}
						this.lotteryGoods.load = {
							isLoadOver: false,
							loadStatus: 'loadmore'
						}
						this.requestLotteryGoods(() => {
							setTimeout(() => {
								this.tabList[current].triggered = false;
							}, 500);
						});
					} else if (current == 2) {
						this.cashGoods.page = {
							pageNum: 1,
							pageCount: 0
						}
						this.cashGoods.load = {
							isLoadOver: false,
							loadStatus: 'loadmore'
						}
						this.requestCashGoods(() => {
							setTimeout(() => {
								this.tabList[current].triggered = false;
							}, 500);
						});
					}
				}
			},
			requestOneBanner() {
				if (this.$common.isEmpty(this.taskBanner)) {
					this.$u.post('/getOneBanner', {
						showPosition: '4'
					}).then(res => {
						this.taskBanner = res.data.imgPath;
					});
				}
			},
			requestSignDay() {
				if (!this.isLogin) {
					return false;
				}
				this.$u.post('/getSignDaysNum').then(res => {
					this.taskSign = res.data;
				});
			},
			requestTask(callBack) {
				if (!this.isLogin && this.isTaskLoadOver) {
					return false;
				}
				this.$u.post('/getTaskList').then(res => {
					this.taskTyroList = [];
					this.taskDailyList = [];
					for (let item of res.data) {
						if (item.taskType == '1') {
							this.taskTyroList.push(item);
						} else if (item.taskType == '2') {
							this.taskDailyList.push(item);
						}
					}
					this.isTaskLoadOver = true;
					callBack && callBack();
				});
			},
			requestBannerList() {
				if (this.$common.isEmpty(this.lotteryBanner)) {
					this.$u.post('/getBannerList', {
						showPosition: '3'
					}).then(res => {
						for (let item of res.data) {
							this.lotteryBanner.push({
								image: item.imgPath,
								href: item.urlPath
							})
						}
					});
				}
			},
			requestLotteryCard() {
				if (!this.isLogin) {
					return false;
				}
				this.lotteryCard.page = {
					pageNum: 1,
					pageCount: 0
				}
				this.lotteryCard.load = {
					isLoadOver: false,
					loadStatus: 'loadmore'
				}
				this.$common.requestResultRender(this, '/getLotteryList', this.lotteryCard, item => item, () => {
					this.lotteryCardAll = [];
					this.lotteryCardCan = [];
					for (let item of this.lotteryCard.resultList) {
						this.lotteryCardAll.push(item);
						if (item.lotteryStatus == '0') {
							this.lotteryCardCan.push(item);
						}
					}
				});
			},
			requestLotteryGoods(callBack) {
				this.$common.requestResultRender(this, '/getGoodsBagList', this.lotteryGoods, item => item, () => {
					callBack && callBack();
				});
			},
			requestCashGoods(callBack) {
				this.$common.requestResultRender(this, '/getGoodsList', this.cashGoods, item => item, () => {
					callBack && callBack();
				});
			},
			toRule(dataType, ruleTitle) {
				this.$u.route('/pages/rule/rule', {
					dataType,
					ruleTitle
				});
			},
			checkLogin(callBack) {
				this.$common.checkLogin(this, '/pages/task/task', {}, () => {
					callBack && callBack();
				})
			},
			doSign() {
				this.checkLogin(() => {
					if (this.taskSign.isSigned) {
						uni.showToast({
							icon: 'none',
							title: '您今天已经签到过了'
						})
					} else {
						this.$u.post('/addSign').then(res => {
							this.taskSign.isSigned = true;
							if (this.$common.isNumber(this.taskSign.signDays)) {
								this.taskSign.signDays = parseInt(this.taskSign.signDays) + 1;
							} else {
								this.taskSign.signDays = 1;
							}
							uni.showToast({
								title: '签到成功'
							})
						});
					}
				})
			},
			doTasks(item) {
				if (item.btnType == '1') {
					this.checkLogin(() => {
						let type = this.$common.getRouteType(item.relatedContent);
						this.$common.getTemplate(this, 'task', () => {
							this.$u.route({
								type,
								url: item.relatedContent
							});
						})
					})
				} else if (item.btnType == '2') {
					this.toRule(item.relatedContent, item.taskName);
				}
			},
			toLottery() {
				this.checkLogin(() => {
					if (this.lotteryCardCan.length > 0) {
						this.$u.route('/pages/lottery/lottery', {
							lotteryId: this.lotteryCardCan[0].lotteryId
						});
					} else {
						uni.showToast({
							icon: 'none',
							title: '您的抽奖券不足'
						})
					}
				})
			},
			toPage(router, param) {
				this.checkLogin(() => {
					this.$u.route('/pages' + router, param);
				})
			},
			toGoodsDetail(item) {
				// goodsSource 商品来源(1: 兑换商品, 2: 卡片, 3: 试用商品)
				this.$u.route('/pages/cashGoods/goodsDetail', {
					goodsId: item.goodsId,
					brandId: item.brandId,
					goodsSource: 1
				});
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
	}

	.task-top {
		position: relative;
		.task-picture {
			height: 260rpx;
			overflow: hidden;
			background: #ffbe0e;
		}
		button {
			z-index: 5;
			height: 44rpx;
			padding: 0 20rpx;
			position: absolute;
			background: rgba(#000, .5);
			@include fontStyle(#fff, 22rpx, 44rpx);
		}
		.button-series {
			left: 0;
			top: 10rpx;
			border-radius: 0 44rpx 44rpx 0;
		}
		.button-rule {
			right: 0;
			top: 10rpx;
			border-radius: 44rpx 0 0 44rpx;
		}
		.button-sign {
			left: 0;
			right: 0;
			margin: auto;
			width: 180rpx;
			bottom: 20rpx;
			height: 50rpx;
			border-radius: 50rpx;
			@include fontStyle(#fff, 24rpx, 50rpx);
			.icon {
				margin-right: 10rpx;
				@include fontStyle($color, 32rpx);
			}
		}
	}

	.task-list {
		background: #fff;
		padding: 30rpx $space 0;
		&:nth-last-child(n+2) {
			margin-bottom: 20rpx;
		}
		.list-top {
			.list-title {
				@include fontStyle(#333, 32rpx);
			}
			.list-button {
				@include fontStyle(#bbb);
				.icon {
					margin-left: 5rpx;
					@include fontStyle(#ccc, 32rpx);
				}
				&.active {
					color: $color;
					.icon {
						color: inherit;
					}
				}
			}
		}
		.list {
			margin-top: 10rpx;
			.item {
				padding: 20rpx 0;
				position: relative;
				&:not(:last-child) {
					&::after {
						content: '';
						position: absolute;
						left: 35rpx;
						right: 0;
						bottom: 0;
						height: 1px;
						margin: auto;
						background: #eee;
					}
				}
				.item-picture {
					width: 70rpx;
					height: 70rpx;
					overflow: hidden;
					margin-right: 30rpx;
				}
				.item-content {
					width: 0;
					margin-right: 40rpx;
					.content-title {
						@include fontStyle;
						@include oneText;
					}
					.content-detail {
						@include fontStyle(#aaa, 24rpx);
						@include muchText(1, 40rpx);
						.icon {
							margin-right: 5rpx;
							position: relative;
							top: 1px;
							@include fontStyle($color, 30rpx);
						}
					}
				}
				.item-button {
					width: 140rpx;
					height: 50rpx;
					border-radius: 50rpx;
					background: $gradientColor;
					@include fontStyle(#fff, 24rpx, 50rpx);
					&[disabled] {
						background: $disabledColor;
					}
				}
			}
		}
	}

	.lottery-list {
		background: #fff;
		padding: 30rpx $space 0;
		&:nth-last-child(n+2) {
			margin-bottom: 20rpx;
		}
		.list-top {
			.list-title {
				@include fontStyle(#333, 32rpx);
			}
			.list-button {
				@include fontStyle(#bbb);
				.icon {
					margin-left: 5rpx;
					@include fontStyle(#ccc);
				}
				&.active {
					color: $color;
					.icon {
						color: inherit;
					}
				}
			}
		}
		.list-card {
			.item {
				padding: 30rpx 0;
				text-align: center;
				.item-title {
					@include fontStyle($color, 40rpx);
					text {
						font-size: 24rpx;
						margin-left: 5rpx;
					}
				}
				.item-content {
					@include fontStyle(#999);
				}
			}
		}
		.list-draw {
			.item {
				padding: 30rpx 0;
				.draw-content {
					@include fontStyle(#999);
				}
				.draw-button {
					height: 60rpx;
					padding: 0 30rpx;
					border-radius: 60rpx;
					background: $gradientColor;
					@include fontStyle(#fff, 28rpx, 60rpx);
				}
			}
		}
		.list-goods {
			margin-top: 5rpx;
			.item {
				padding: 25rpx 0;
				&:nth-child(n+2) {
					border-top: 1px solid #eee;
				}
				.item-picture {
					width: 200rpx;
					height: 200rpx;
					overflow: hidden;
					margin-right: 25rpx;
					border-radius: 20rpx;
				}
				.item-right {
					width: 0;
				}
				.item-title {
					@include fontStyle;
					@include muchText(2, 40rpx);
				}
				.item-price {
					margin-top: 20rpx;
					@include fontStyle(#333, 26rpx);
					text {
						color: $color;
						font-weight: bold;
					}
				}
			}
		}
	}

	.cash-top {
		position: relative;
		.cash-background {
			height: 310rpx;
			@include backgroundImage('/static/images/img13.png');
		}
		.cash-rule {
			position: absolute;
			right: 10rpx;
			top: 10rpx;
			z-index: 5;
			.rule-text {
				height: 48rpx;
				padding: 0 15rpx;
				border-radius: 8rpx;
				background: #fff;
				position: relative;
				@include fontStyle(#555, 24rpx, 48rpx);
				&::after {
					content: ' ';
					position: absolute;
					height: 0;
					width: 0;
					border: 14rpx solid transparent;
					border-left-color: #fff;
					right: -25rpx;
					bottom: 0;
					top: 0;
					margin: auto;
				}
			}
			.rule-icon {
				margin-left: 20rpx;
				@include fontStyle(#fff, 32rpx, 48rpx);
			}
		}
		.cash-userInfo {
			padding-top: 10rpx;
			text-align: center;
			@include positionCenter;
		}
		.userInfo-picture {
			margin: 0 auto;
			width: 130rpx;
			height: 130rpx;
		}
		.userInfo-username {
			margin-top: 10rpx;
			@include fontStyle;
		}
		.userInfo-account {
			margin-top: 20rpx;
			.account-number {
				@include fontStyle($color, 36rpx);
			}
			.account-title {
				margin-top: 5rpx;
				@include fontStyle(#aaa);
			}
		}

	}

	.cash-list {
		margin-top: 20rpx;
		.list {
			.item {
				text-align: left;
				background: #fff;
				padding: 25rpx $space;
				&:nth-child(n+2) {
					border-top: 1px solid #eee;
				}
				.item-picture {
					width: 200rpx;
					height: 200rpx;
					overflow: hidden;
					margin-right: 25rpx;
					border-radius: 20rpx;
				}
				.item-right {
					width: 0;
				}
				.item-title {
					@include fontStyle;
					@include muchText(2, 40rpx);
				}
				.item-price {
					margin-top: 14rpx;
				}
				.item-cash {
					margin-top: 10rpx;
				}
				.item-number {
					@include fontStyle(#333, 26rpx);
					text {
						color: $color;
						font-weight: bold;
					}
				}
				.item-button {
					height: 44rpx;
					padding: 0 20rpx;
					border-radius: 44rpx;
					background: $gradientColor;
					@include fontStyle(#fff, 22rpx, 44rpx);
				}
			}
		}
	}
</style>