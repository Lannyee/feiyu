<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="我的鱼币" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="money-top">
            <view class="money-background"></view>
            <view class="money-rule flex flex-column-center" @tap="toRule">
                <text class="rule-text">鱼币说明</text>
                <u-icon class="rule-icon" name="question-circle"></u-icon>
            </view>
        </view>

        <view class="money-account">
            <view class="money-account-container">
                <view class="account-top flex flex-column-center flex-row-between">
                    <view class="account-title">可用鱼币</view>
                    <view class="button-more">
                        <button class="flex flex-column-center" hover-class="active" @tap="toHome">
                            <text class="button-text">获得更多</text>
                            <u-icon class="button-icon" name="arrow-right"></u-icon>
                        </button>
                    </view>
                </view>
                <view class="account-number">{{ money }}</view>
                <view class="account-button flex flex-row-around">
                    <button hover-class="active" @tap="toWithdraw">立即提现</button>
                    <button hover-class="active" @tap="toRecord">提现记录</button>
                </view>
            </view>
        </view>

        <view class="money-currency">
            <view class="list">
                <view class="item flex" v-for="(item, index) in currency.resultList" :key="index">
                    <view class="item-left">
                        <view class="item-adorn"></view>
                        <view class="item-number">{{ item.isAdd ? '+' : '-' }}<text>{{ item.value }}</text></view>
                    </view>
                    <view class="item-right flex1 flex flex-column-center">
                        <view class="item-right-container">
                            <view class="item-title">{{ item.source }}</view>
                            <view class="item-time">{{ item.createTime }}</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="currency.load.isLoadOver && currency.resultList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            money: 0,
            currency: {
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
                    currencyType: '1'
                },
                refresher: {
                    isClear: true
                }
            }
        }),
        onLoad() {
            uni.removeStorageSync('withdrawalSuccess');
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    if (this.$common.isNumber(data.money)) {
                        this.money = parseFloat(data.money);
                    }

                    this.requestCurrency();
				}
			}, true);
        },
        onShow() {
            if (uni.getStorageSync('withdrawalSuccess')) {
                uni.removeStorageSync('withdrawalSuccess');
                this.money = 0;
                this.currency.page = {
                    pageNum: 1,
                    pageCount: 0
                }
                this.currency.load = {
                    isLoadOver: false,
                    loadStatus: 'loadmore'
                }
                this.$common.getCustomer(this, data => {
                    if (this.$common.isNotEmpty(data)) {
                        if (this.$common.isNumber(data.money)) {
                            this.money = parseFloat(data.money);
                        }

                        this.requestCurrency();
                    }
                }, true);
            }
        },
        onReachBottom() {
            this.requestCurrency();
		},
        methods: {
            requestCurrency() {
                this.$common.requestResultRender(this, '/getCurrencyList', this.currency, item => {
                    if (this.$common.isNumber(item.value)) {
                        if (parseFloat(item.value) < 0) {
                            item.isAdd = false;
                        } else {
                            item.isAdd = true;
                        }
                        item.value = Math.abs(parseFloat(item.value));
                    }
                    return item;
                });
            },
            toRule() {
                this.$u.route('/pages/rule/rule', {
                    dataType: 'fish_currency',
                    ruleTitle: '鱼币说明'
                });
            },
            toHome() {
                this.$u.route({
                    type: 'tab',
                    url: '/pages/home/home'
                });
            },
            toWithdraw() {
                if (this.money == 0) {
                    uni.showToast({
						icon: 'none',
						title: '您的鱼币不足，不能提现'
					})
                    return false;
                } else if (this.money < 0) {
                    uni.showToast({
						icon: 'none',
						title: '您的鱼币存在异常，不能提现'
					})
                    return false;
                }
                this.$u.route('/pages/withdraw/withdraw');
            },
            toRecord() {
                this.$u.route('/pages/withdraw/record');
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        padding-bottom: 50rpx;
    }
    
    .money-top {
        position: relative;
        .money-background {
            height: 225rpx;
            @include backgroundImage('/static/images/img04.png');
        }
        .money-rule {
            position: absolute;
            right: 10rpx;
            top: 10rpx;
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
    }

    .money-account {
        padding: 0 $space;
        margin-top: -80rpx;
        position: relative;
        z-index: 5;
        .money-account-container {
            background: #fff;
            padding: 25rpx $space 60rpx;
            box-shadow: 0 10rpx 20rpx rgba(#000, .03);
            .account-top {
                .account-title {
                    @include fontStyle(#333, 32rpx);
                }
                .button-more {
                    button {
                        &.active {
                            .button-text,
                            .button-icon {
                                color: $color;
                            }
                        }
                    }
                    .button-text {
                        @include fontStyle(#bbb);
                    }
                    .button-icon {
                        margin-left: 5rpx;
                        @include fontStyle(#ccc);
                    }
                }
            }
            .account-number {
                margin-top: 50rpx;
                font-weight: bold;
                text-align: center;
                @include fontStyle($color, 60rpx, 60rpx);
            }
            .account-button {
                margin-top: 40rpx;
                button {
                    border: 1px solid $color;
                    height: 48rpx;
                    width: 160rpx;
                    border-radius: 48rpx;
                    @include fontStyle($color, 24rpx, calc(48rpx - 2px));
                    &.active {
                        color: #fff;
                        background: $color;
                    }
                }
            }
        }
    }

    .money-currency {
        padding: 0 $space;
        margin-top: 30rpx;
        .list {
            .item {
                background: #fff;
                &:nth-child(n+2) {
                    margin-top: 10rpx;
                }
                .item-left {
                    width: 200rpx;
                    height: 160rpx;
                    position: relative;
                    background: linear-gradient(to right, rgba($color, 1) 0%, rgba($color, .5) 100%);
                    .item-adorn {
                        position: absolute;
                        top: -10rpx;
                        left: -5rpx;
                        width: 15rpx;
                        height: 100%;
                        margin-top: 10rpx;
                        background-size: 30rpx 15rpx;
                        background-color: $backgroundColor;
                        background-position: 100% 35%;
                        background-image: linear-gradient(-45deg, rgba($color, 1) 25%, transparent 25%, transparent),
                                        linear-gradient(-135deg, rgba($color, 1) 25%, transparent 25%, transparent),
                                        linear-gradient(-45deg, transparent 75%, rgba($color, 1) 75%),
                                        linear-gradient(-135deg, transparent 75%, rgba($color, 1) 75%);
                    }
                    .item-number {
                        text-align: center;
                        @include fontStyle(#fff, 40rpx, 160rpx);
                        text {
                            margin-left: 5rpx;
                        }
                    }
                }
                .item-right {
                    height: 160rpx;
                    padding-left: 50rpx;
                    .item-title {
                        @include fontStyle(#666);
                    }
                    .item-time {
                        margin-top: 5rpx;
                        @include fontStyle(#999, 24rpx);
                    }
                }
            }
        }
        .list-default {
            padding: 150rpx 0;
        }
    }
</style>