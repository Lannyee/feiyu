<template>
	<view class="page-container">
		<u-navbar :is-back="false" title="个人中心" title-size="32" title-color="#333" z-index="99999" :border-bottom="false"></u-navbar>

		<view class="customer-module customer-info">
			<button class="info-top flex flex-column-center" hover-class="active" @tap="toPage('/personal/personal')">
				<view class="info-picture">
					<u-image :src="userInfo.headImg || '/static/images/user.png'" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
				</view>
				<view class="info-container flex1" v-if="isLogin">
					<view class="info-nickname">{{ userInfo.nickName || '' }}<text class="info-region">{{ userInfo.province || '' }} {{ userInfo.city || '' }}</text></view>
					<view class="info-platform flex flex-wrap">
						<image class="platform-icon" v-for="(item, index) in bindingList" :key="index" :class="{'active': item.auditStatus == '1'}" :src="item.icon" mode="aspectFill"></image>
					</view>
				</view>
				<view class="info-container flex1" v-else>
					<view class="info-title">未登录</view>
					<view class="info-content">点击登录账号</view>
				</view>
				<view class="info-right flex flex-column-center" v-if="isLogin">
					<u-icon class="info-right-icon" name="arrow-right"></u-icon>
				</view>
			</button>

			<view class="info-list flex">
				<button class="item flex1 flex-column flex-center" hover-class="active" @tap="toPage('/account/money')">
					<text class="item-number">{{ disposeNumber(userInfo.money, 99999) }}</text>
					<text class="item-title">鱼币</text>
				</button>
				<button class="item flex1 flex-column flex-center" hover-class="active" @tap="toPage('/account/credit')">
					<text class="item-number">{{ disposeNumber(userInfo.integral, 99999) }}</text>
					<text class="item-title">蟹币</text>
				</button>
				<button class="item flex1 flex-column flex-center" hover-class="active" @tap="toPage('/account/card')">
					<text class="item-number">{{ disposeNumber(userInfo.lotteryNum, 99999) }}</text>
					<text class="item-title">奖券</text>
				</button>
				<button class="item flex1 flex-column flex-center" hover-class="active" @tap="toPage('/apply/apply')">
					<text class="item-number">{{ disposeNumber(userInfo.toBeTestedNum, 99999) }}</text>
					<text class="item-title">待测评</text>
				</button>
			</view>
		</view>

		<view class="customer-module customer-apply">
			<view class="module-title">我的试用</view>
			<view class="module-container flex">
				<button class="item flex1" hover-class="active" @tap="toPage('/apply/apply')">
					<view class="item-icon-container">
						<u-icon class="item-icon" name="shenqing" custom-prefix="custom-icon"></u-icon>
					</view>
					<view class="item-content">
						<text class="item-title">已申请</text>
						<text class="item-number">{{ disposeNumber(userInfo.appliedNum) }}</text>
					</view>
					<view class="item-badge" v-if="userInfo.disposeNum > 0">{{ userInfo.disposeNum }}</view>
				</button>
				<button class="item flex1" hover-class="active" @tap="toPage('/apply/apply', { 'index': 1 })">
					<view class="item-icon-container">
						<u-icon class="item-icon" name="yiwancheng" custom-prefix="custom-icon"></u-icon>
					</view>
					<view class="item-content">
						<text class="item-title">已结束</text>
						<text class="item-number">{{ disposeNumber(userInfo.endedNum) }}</text>
					</view>
				</button>
				<button class="item flex1" hover-class="active" @tap="toPage('/apply/apply', { 'index': 2 })">
					<view class="item-icon-container">
						<u-icon class="item-icon" name="shensu" custom-prefix="custom-icon"></u-icon>
					</view>
					<view class="item-content">
						<text class="item-title">申诉中</text>
						<text class="item-number">{{ disposeNumber(userInfo.appealNum) }}</text>
					</view>
				</button>
				<button class="item flex1" hover-class="active" @tap="toPage('/apply/apply')">
					<view class="item-icon-container">
						<u-icon class="item-icon" name="wuliu" custom-prefix="custom-icon"></u-icon>
					</view>
					<view class="item-content">
						<text class="item-title">查看物流</text>
						<text class="item-number">{{ disposeNumber(userInfo.checkLogisticsNum) }}</text>
					</view>
				</button>
			</view>
		</view>

		<view class="customer-module-column flex">
			<view class="customer-module column-item customer-common flex1">
				<view class="module-title">我的常用</view>
				<view class="module-container flex flex-wrap">
					<button class="item" hover-class="active" @tap="toPage('/account/money')">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="jinbi" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">我的鱼币</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/collect/collect')">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="shoucang" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">我的收藏</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/invite/invite')">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="yaoqing1" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">我的邀请</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/withdraw/withdraw')">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="tixian1" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">绑卡提现</view>
					</button>
				</view>
			</view>

			<view class="customer-module column-item customer-order flex1">
				<view class="module-title">兑换订单</view>
				<view class="module-container flex flex-wrap">
					<button class="item" hover-class="active" @tap="toPage('/cash/cash')">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="daizhifu" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">
							<text class="item-title">待支付</text>
							<text class="item-number">{{ disposeNumber(userInfo.unpaidNum) }}</text>
						</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/cash/cash', { 'index': 1 })">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="yiguoqipaiche" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">
							<text class="item-title">待发货</text>
							<text class="item-number">{{ disposeNumber(userInfo.pendingNum) }}</text>
						</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/cash/cash', { 'index': 2 })">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="yipaiche" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">
							<text class="item-title">待收货</text>
							<text class="item-number">{{ disposeNumber(userInfo.receivingNum) }}</text>
						</view>
					</button>
					<button class="item" hover-class="active" @tap="toPage('/cash/cash', { 'index': 3 })">
						<view class="item-icon-container">
							<u-icon class="item-icon" name="yiwancheng1" custom-prefix="custom-icon"></u-icon>
						</view>
						<view class="item-content">
							<text class="item-title">已完成</text>
							<text class="item-number">{{ disposeNumber(userInfo.accomplishNum) }}</text>
						</view>
					</button>
				</view>
			</view>
		</view>

		<view class="customer-module customer-menu">
			<button class="item" hover-class="active" @tap="toPage('/personal/personal')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-info"></text>
						<text class="item-title">个人资料</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/address/address')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-dizhi"></text>
						<text class="item-title">收货信息</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/platform/platform')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-pingtai_mokuai"></text>
						<text class="item-title">多平台管理</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/bankCard/bankCard')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-yinhangka1"></text>
						<text class="item-title">收款账户绑定</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/finishApply/finishApply')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-lishi"></text>
						<text class="item-title">历史接单明细</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
		</view>

		<view class="customer-module customer-menu">
			<button class="item" hover-class="active" @tap="toPage('/commerce/commerce', {}, false)">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-shangwuhezuo3"></text>
						<text class="item-title">商务合作</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/sensitive/sensitive', {}, false)">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-minganci"></text>
						<text class="item-title">敏感词检测</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toPage('/feedback/feedback')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-yonghufankui"></text>
						<text class="item-title">用户反馈</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" open-type="contact">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-rengongkefu"></text>
						<text class="item-title">人工客服</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
		</view>

		<view class="customer-module customer-menu">
			<button class="item" hover-class="active" @tap="toPage('/question/question', {}, false)">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-wenti"></text>
						<text class="item-title">常见问题</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toRule('rule', 'customer_agreement', '飞鱼用户使用服务协议')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-huiyuanruhuxieyi"></text>
						<text class="item-title">用户协议</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
			<button class="item" hover-class="active" @tap="toRule('company', 'email', '官方邮箱')">
				<view class="item-container flex flex-row-between">
					<view class="item-left flex flex-column-center">
						<text class="item-icon custom-icon custom-icon-youxiang"></text>
						<text class="item-title">官方邮箱</text>
					</view>
					<view class="item-right flex flex-column-center flex-row-end">
						<u-icon class="item-icon" name="arrow-right"></u-icon>
					</view>
				</view>
			</button>
		</view>

		<button class="logout-button" @tap="logout" v-if="isLogin">退出登录</button>
	</view>
</template>

<script>
	export default {
		data: () => ({
			userInfo: {},
			isLogin: false,
			bindingList: [
				{
					platformName: '小红书',
					platformId: '2',
					auditStatus: null,
					icon: '/static/images/platform/icon03.png',
				},
				{
					platformName: '抖音',
					platformId: '1',
					auditStatus: null,
					icon: '/static/images/platform/icon04.png',
				},
				{
					platformName: '微博',
					platformId: '4',
					auditStatus: null,
					icon: '/static/images/platform/icon05.png',
				},
				// {
				// 	platformName: '快手',
				// 	platformId: '5',
				// 	auditStatus: null,
				// 	icon: '/static/images/platform/icon02.png',
				// },
				// {
				// 	platformName: '淘宝',
				// 	platformId: '3',
				// 	auditStatus: null,
				// 	icon: '/static/images/platform/icon07.png',
				// },
				{
					platformName: 'B站',
					platformId: '7',
					auditStatus: null,
					icon: '/static/images/platform/icon06.png',
				}
			],
		}),
		onLoad() {

		},
		onShow() {
			this.$common.getCustomer(this, data => {
				this.$common.renderTabBarBadgeCustomer(data);
				if (this.$common.isNotEmpty(data)) {
					this.userInfo = data;
					this.isLogin = true;
					this.renderBindingList(data.bindingType);

					let money = 0;
					let beforeMoney = 0;
					if (this.$common.isNumber(this.userInfo.money)) {
						money = parseFloat(this.userInfo.money);
					}
					if (this.$common.isNumber(uni.getStorageSync('beforeMoney'))) {
						beforeMoney = parseFloat(uni.getStorageSync('beforeMoney'));
					}
					if (beforeMoney < money) {
						uni.setStorageSync('beforeMoney', money);
						uni.showModal({
							title: '提示',
							content: '您有' + (money - beforeMoney) + '个鱼币到账了，是否前往提现？',
							confirmText: '去提现',
							success: res => {
								if (res.confirm) {
									this.$u.route('/pages/withdraw/withdraw');
								}
							}
						})
					} else {
						uni.setStorageSync('beforeMoney', money);
					}
				} else {
					this.userInfo = {};
					this.isLogin = false;
				}
			});
		},
		methods: {
			renderBindingList(bindingType) {
				if (this.$common.isNotEmpty(bindingType)) {
					for (let $item of this.bindingList) {
						for (let item of bindingType) {
							if (item.platformId == $item.platformId) {
								$item.auditStatus = item.auditStatus;
								break;
							}
						}
					}
				}
			},
			disposeNumber(number, max = 99) {
				if (this.$common.isNumber(number)) {
					if (parseFloat(number) > max) {
						return max + '+';
					} else {
						return number;
					}
				} else {
					return 0;
				}
			},
			logout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: res => {
						if (res.confirm) {
							uni.removeStorageSync('usertoken');

							this.userInfo = {};
							this.isLogin = false;
							
							uni.pageScrollTo({
								scrollTop: 0,
								duration: 0
							});

							this.$u.route({
								type: 'reLaunch',
								url: '/pages/customer/customer'
							});
						}
					}
				})
			},
			toPage(url, params, isToLogin = true) {
				// 单独处理我的邀请
				if (url == '/invite/invite') {
					uni.showToast({
						icon: 'none',
						title: '活动升级中，敬请期待~'
					})
					return false;
				}
				if (isToLogin) {
					this.$common.checkLogin(this, '/pages/customer/customer', {}, () => {
						if (url == '/withdraw/withdraw') {
							let money = 0;
							if (this.$common.isNumber(this.userInfo.money)) {
								money = parseFloat(this.userInfo.money);
							}
							if (money == 0) {
								uni.showToast({
									icon: 'none',
									title: '您的鱼币不足，不能提现'
								})
								return false;
							} else if (money < 0) {
								uni.showToast({
									icon: 'none',
									title: '您的鱼币存在异常，不能提现'
								})
								return false;
							}
						}
						this.$u.route('/pages' + url, params);
					})
				} else {
					this.$u.route('/pages' + url, params);
				}
			},
			toRule(groupCode, dataType, ruleTitle) {
				this.$u.route('/pages/rule/rule', {
					groupCode,
					dataType,
					ruleTitle
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/public.scss";

	.page-container {
		padding: 30rpx $space;
	}
	
	.customer-module {
		overflow: hidden;
		background: #fff;
		border-radius: 20rpx;
		&:nth-of-type(n+2) {
			margin-top: 25rpx;
		}
		.module-title {
			padding: 30rpx 30rpx 20rpx;
			font-weight: bold;
			@include fontStyle;
		}
		.module-container {
			padding-bottom: 10rpx;
			.item {
				padding: 20rpx 10rpx;
				position: relative;
				.item-icon {
					@include fontStyle(#555, 48rpx, 48rpx);
				}
				.item-content {
					margin-top: 10rpx;
					@include fontStyle(#333, 24rpx);
					.item-number {
						color: $color;
						font-weight: bold;
						margin-left: 10rpx;
					}
				}
				.item-badge {
					position: absolute;
					right: 30rpx;
					top: 0;
					padding: 0 12rpx;
					border-radius: 20rpx;
					background: #fa5151;
					@include fontStyle(#fff, 24rpx, 36rpx);
				}
			}
		}
		button {
			background: #fff;
			&.active {
				background: #f9f9f9;
			}
		}
	}

	.customer-module-column {
		margin-top: 25rpx;
		.column-item {
			margin-top: 0;
			&:not(:first-of-type) {
				margin-left: 25rpx;
			}
		}
		.module-container {
			.item {
				width: 50%;
				&:not(:nth-child(n+3)) {
					padding-bottom: 20rpx;
				}
				&:nth-child(n+3) {
					padding-top: 20rpx;
				}
			}
		}
	}

	.customer-info {
		.info-top {
			padding: 30rpx 20rpx 20rpx 30rpx;
			.info-picture {
				width: 120rpx;
				height: 120rpx;
			}
			.info-container {
				width: 0;
				margin: 0 20rpx 0 30rpx;
			}
			.info-platform {
				margin-top: 20rpx;
				image {
					&:not(:last-child) {
						margin-right: 10rpx;
					}
					&:not(.active) {
						@include filterGrayscale;
					}
				}
			}
			.info-nickname {
				text-align: left;
				font-weight: bold;
				@include fontStyle(#333, 32rpx);
				@include muchText(1, 40rpx);
			}
			.info-region {
				font-weight: normal;
				margin-left: 20rpx;
				@include fontStyle(#999, 24rpx);
			}
			.info-right {
				.info-right-icon {
					@include fontStyle(#bbb, 32rpx);
				}
			}
			.info-title {
				text-align: left;
				font-weight: bold;
				@include fontStyle(#333, 32rpx);
			}
			.info-content {
				text-align: left;
				margin-top: 10rpx;
				@include fontStyle(#999, 24rpx);
			}
		}
		.info-list {
			padding-bottom: 10rpx;
			.item {
				padding: 20rpx 10rpx;
				.item-number {
					font-weight: bold;
					@include fontStyle($color, 32rpx);
				}
				.item-title {
					margin-top: 10rpx;
					@include fontStyle(#333, 24rpx);
				}
			}
		}
	}

	.customer-menu {
		padding: 15rpx 0;
		.item {
			position: relative;
			&:not(:last-of-type) {
				.item-container {
					&::after {
						content: '';
						position: absolute;
						z-index: 5;
						left: 30rpx;
						right: 0;
						bottom: 0;
						height: 1px;
						margin: auto;
						background: #f2f2f2;
					}
				}
			}
			.item-container {
				height: 96rpx;
				padding: 0 20rpx 0 30rpx;
			}
			.item-left {
				max-width: 50%;
				.item-icon {
					width: 64rpx;
					text-align: left;
					@include fontStyle($color, 40rpx, 60rpx);
				}
				.item-title {
					@include fontStyle;
					@include muchText(1, 40rpx);
				}
			}
			.item-right {
				.item-icon {
					@include fontStyle(#cdcdcd, 32rpx);
				}
			}
		}
	}

	.logout-button {
		height: 90rpx;
		margin-top: 30rpx;
		font-weight: bold;
		border-radius: 10rpx;
		@include fontStyle(#fff, 32rpx, 90rpx);
		@include backgroundGradientColor;
	}
</style>