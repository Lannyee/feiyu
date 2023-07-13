<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="我的兑换" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" :is-scroll="false" :list="tabList" :current="tabCurrent" height="90" active-color="#f36e96" :bold="false" bar-width="187.5" bar-height="4" @change="changeTab"></u-tabs-swiper>
        </view>
        <swiper ref="swiper" class="swiper-container flex1" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
            <swiper-item class="swiper-item" v-for="(swiperItem, swiperIndex) in cash" :key="swiperIndex">
                <scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="swiperItem.refresher.triggered" class="scroll-view" @refresherrefresh="refresherSwiper(swiperIndex)" @scrolltolower="onreachBottom(swiperIndex)">
                    <view class="list" v-if="swiperItem.resultList.length > 0">
                        <view class="item" v-for="(item, index) in swiperItem.resultList" :key="index">
                            <view class="item-order flex flex-column-center">
                                <view class="order-picture">
                                    <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                                </view>
                                <view class="order-info flex1">
                                    <view class="order-title">{{ item.goodsName }}</view>
                                    <view class="order-price flex flex-column-center flex-row-between">
                                        <view class="order-number">价格：<text>￥{{ item.goodsPrice }}</text></view>
                                        <view class="order-amount">x{{ item.buyNum || 1 }}</view>
                                    </view>
                                    <view class="order-payment flex flex-column-center flex-row-between">
                                        <view class="order-number">付款金额：<text>￥{{ item.finalPrice || 0 }}</text></view>
                                    </view>
                                </view>
                            </view>
                            <view class="item-operate" v-if="swiperIndex == 0 || swiperIndex == 2">
                                <view class="operate-button flex flex-row-end">
                                    <button hover-class="active" @tap="cancelCash(item.orderId)" v-if="swiperIndex == 0">取消订单</button>
                                    <button hover-class="active" @tap="againPayment(item.orderId)" v-if="swiperIndex == 0">去支付</button>
                                    <button hover-class="active" @tap="toLogistics(item.orderId)" v-if="swiperIndex == 2">查看物流</button>
                                    <button hover-class="active" @tap="confirmDelivery(item.orderId)" v-if="swiperIndex == 2">确认收货</button>
                                </view>
                            </view>
                        </view>
                    </view>

                    <view class="list-default" v-if="swiperItem.load.isLoadOver && swiperItem.resultList.length == 0">
                        <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                        <view class="default-text">暂无数据</view>
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
                    name: '待支付'
                },
                {
                    name: '待发货'
                },
                {
                    name: '待收货'
                },
                {
                    name: '已完成'
                }
            ],
            tabCurrent: 0,
            swiperCurrent: 0,
            isInitCurrent: false,
            cash: [
                {
                    index: 0,
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
                        orderStatus: '0'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                },
                {
                    index: 1,
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
                        orderStatus: '1'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                },
                {
                    index: 2,
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
                        orderStatus: '2'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                },
                {
                    index: 3,
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
                        orderStatus: '3'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                }
            ]
        }),
        onLoad(data) {
            if (data.index > 0) {
                this.tabCurrent = data.index;
                this.swiperCurrent = data.index;
            }
            setTimeout(() => {
                this.isInitCurrent = true;
            }, 1000)
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestCash(this.swiperCurrent);
				}
			}, true);
        },
        methods: {
            changeTab(index) {
                this.swiperCurrent = index;
            },
            transition(e) {
				let dx = e.detail.dx;
                if (this.isInitCurrent) {
                    this.$refs.uTabs.setDx(dx);
                }
			},
			animationfinish(e) {
				let current = e.detail.current;
				this.$refs.uTabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.tabCurrent = current;
                if (!this.cash[current].load.isLoadOver) {
                    this.requestCash(current);
                }
			},
            onreachBottom(current) {
                this.requestCash(current);
            },
            refresherSwiper(current) {
                if (!this.cash[current].refresher.triggered) {
                    this.cash[current].refresher.triggered = true;
                    this.reloadRequest(current);
                    this.requestCash(current, () => {
                        setTimeout(() => {
                            this.cash[current].refresher.triggered = false;
                        }, 500);
                    });
                }
            },
            requestCash(current, callBack) {
                this.$common.requestResultRender(this, '/getOrderList', this.cash[current], item => item, callBack && callBack());
            },
            cancelCash(orderId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要取消此订单吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/cancelOrderByOrderId', {
                                orderId
                            }).then(res => {
                                uni.showToast({
                                    title: '取消成功'
                                });
                                this.toCash(0);
                            });
                        }
                    }
                })
            },
            againPayment(orderId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要支付此订单吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/payAgainByOrderId', {
                                orderId
                            }).then(res => {
                                if (this.$common.isNotEmpty(res.data)) {
                                    this.payment(res.data);
                                }
                            });
                        }
                    }
                })
            },
            toLogistics(orderId) {
                this.$u.route('/pages/logistics/logistics', {
                    orderId
                });
            },
            confirmDelivery(orderId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要收货吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/confirmReceiptByOrderId', {
                                orderId
                            }).then(res => {
                                uni.showToast({
                                    title: '收货成功'
                                });
                                this.toCash(3);
                            });
                        }
                    }
                })
            },
            payment(data) {
                uni.requestPayment({
                    provider: 'wxpay',
                    orderInfo: {
                        appId: data.appId
                    },
                    timeStamp: data.timeStamp,
                    nonceStr: data.nonceStr,
                    package: data.package,
                    signType: data.signType,
                    paySign: data.paySign,
                    success: (res) => {
                        this.$common.getTemplate(this, 'cash', () => {
                            uni.showToast({
                                title: '支付成功'
                            });
                            this.toCash(1);
                        })
                    },
                    fail: (error) => {
                        uni.showToast({
                            icon: 'error',
                            title: '支付失败'
                        });
                    }
                })
            },
            toCash(index) {
                setTimeout(() => {
                    this.reloadRequest(index);
                    if (index == 1) {
                        this.reloadRequest(0);
                    } else if (index == 3) {
                        this.reloadRequest(2);
                    }
                    this.changeTab(index);
                    this.requestCash(this.swiperCurrent);
                }, 200)
            },
            reloadRequest(current) {
				this.cash[current].page = {
					pageNum: 1,
					pageCount: 0
				}
				this.cash[current].load = {
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
            padding: 30rpx $space 50rpx;
            .item {
                position: relative;
                background: #fff;
                overflow: hidden;
                padding: 30rpx;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-order {
                    .order-picture {
                        width: 200rpx;
                        height: 200rpx;
                        overflow: hidden;
                        margin-right: 25rpx;
                        border-radius: 20rpx;
                    }
                    .order-title {
                        @include fontStyle;
                        @include muchText(2, 40rpx);
                    }
                    .order-number {
                        word-break: break-all;
                        padding-right: 10rpx;
                        text {
                            color: $color;
                            font-weight: bold;
                        }
                    }
                    .order-amount,
                    .order-text {
                        color: #aaa;
                    }
                    .order-price,
                    .order-payment {
                        margin-top: 10rpx;
                        @include fontStyle(#333, 26rpx);
                    }
                }
                .item-operate {
                    margin-top: 25rpx;
                    .operate-button {
                        button {
                            height: 50rpx;
                            padding: 0 20rpx;
                            min-width: 150rpx;
                            border-radius: 50rpx;
                            border: 1px solid $color;
                            @include fontStyle($color, 24rpx, calc(50rpx - 2px));
                            &.active {
                                color: #fff;
                                background: $color;
                            }
                            &:nth-child(n+2) {
                                margin-left: 25rpx;
                            }
                        }
                    }
                }
            }
        }
    }
</style>