<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="确认订单" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="order-module order-goods u-skeleton">
            <view class="module-content flex flex-column-center">
                <view class="goods-picture u-skeleton-fillet">
                    <u-image :src="goodsOrder.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                </view>
                <view class="goods-info flex1">
                    <view class="goods-title u-skeleton-fillet">{{ goodsOrder.goodsName }}</view>
                    <view class="goods-price flex flex-column-center flex-row-between u-skeleton-fillet">
                        <view class="goods-number">价格：<text>￥{{ goodsOrder.currentPrice }}</text></view>
                        <view class="goods-amount">x1</view>
                    </view>
                </view>
            </view>
        </view>

        <u-skeleton :loading="loading" :animation="true"></u-skeleton>
        
        <button class="order-module order-address" v-if="addressLoadOver" @tap="toAddress">
            <view class="module-content flex flex-column-center">
                <view class="address-left"><u-icon name="map-fill" class="icon"></u-icon></view>
                <view class="address-center flex1">
                    <view class="flex flex-column-center flex-wrap">
                        <view class="address-name">{{ address.trueName || '暂无地址' }}</view>
                        <view class="address-phone" v-if="address.phone">{{ address.phone }}</view>
                    </view>
                    <view class="address-detail" v-if="address.addressDetails">{{ address.provinceName }} {{ address.cityName }} {{ address.countyName }} {{ address.addressDetails }}</view>
                    <view class="address-detail" v-else>前往添加选择地址</view>
                </view>
                <view class="address-right"><u-icon name="arrow-right" class="icon"></u-icon></view>
            </view>
        </button>

        <view class="order-module order-detail" v-if="goodsOrderLoadOver">
            <view class="module-content">
                <view class="list">
                    <view class="item flex flex-column-center flex-row-between">
                        <view class="item-title">商品价格</view>
                        <view class="item-number">￥{{ goodsOrder.goodsTotalPrice || 0 }}</view>
                    </view>
                    <view class="item flex flex-column-center flex-row-between">
                        <view class="item-title">运费</view>
                        <view class="item-number">￥{{ goodsOrder.freight || 0 }}</view>
                    </view>
                    <view class="item flex flex-column-center flex-row-between" @tap="deduction('integral')" v-if="originIntegral > 0 && isShowIntegral">
                        <view class="item-title flex1">使用蟹币抵扣<text>￥{{ goodsOrder.deductionIntegral || 0 }}</text></view>
                        <view class="item-checkbox flex-center"><u-checkbox v-model="isUseIntegral" shape="circle" size="36" icon-size="20" active-color="#f36e96"></u-checkbox></view>
                    </view>
                    <view class="item flex flex-column-center flex-row-between" @tap="deduction('money')" v-if="originMoney > 0 && isShowMoney">
                        <view class="item-title flex1">使用鱼币抵扣<text>￥{{ goodsOrder.deductionMoney || 0 }}</text></view>
                        <view class="item-checkbox flex-center"><u-checkbox v-model="isUseMoney" shape="circle" size="36" icon-size="20" active-color="#f36e96"></u-checkbox></view>
                    </view>
                    <view class="item flex flex-column-center flex-row-end">
                        <view class="item-title">共1件商品</view>
                        <view class="item-content">小计<text>￥{{ goodsOrder.finalPrice || 0 }}</text></view>
                    </view>
                </view>
            </view>
        </view>

        <view class="goods-button" v-if="goodsOrderLoadOver">
            <view class="flex">
                <button class="flex1" hover-class="active" @tap="$common.navbarGoBack(this)">取消</button>
                <button class="flex1" @tap="addOrder">付款<text>￥{{ goodsOrder.paymentMoney || 0 }}</text></button>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsOrder: {},
            address: {},
            loading: true,
            goodsOrderLoadOver: false,
            addressLoadOver: false,
            goodsId: null,
            goodsSource: null,
            isUseIntegral: false,
            isUseMoney: false,
            isShowIntegral: false,
            isShowMoney: false,
            originIntegral: 0,
            originMoney: 0
        }),
        onLoad(data) {
            uni.removeStorageSync('address');
            this.goodsId = data.goodsId;
            this.goodsSource = data.goodsSource;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestAddress();
                    this.requestGoodsOrder(this.goodsId, this.goodsSource);
                }
			}, true)
        },
        onShow() {
            if (uni.getStorageSync('address')) {
                this.address = uni.getStorageSync('address');
            } else {
                this.address = {};
            }
        },
        methods: {
            addOrder() {
                if (this.$common.isEmpty(this.address.addressId)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写收货地址信息'
                    })
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要兑换该商品吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/addOrder', {
                                addressId: this.address.addressId,
                                goodsId: this.goodsOrder.goodsId,
                                goodsSource: '2',
                                isUseIntegral: this.isUseIntegral,
                                integral: this.isUseIntegral ? this.goodsOrder.deductionIntegral : 0,
                                isUseMoney: this.isUseMoney,
                                money: this.isUseMoney ? this.goodsOrder.deductionMoney : 0
                            }).then(res => {
                                if (this.$common.isNotEmpty(res.data)) {
                                    this.payment(res.data);
                                } else {
                                    this.$common.getTemplate(this, 'cash', () => {
                                        uni.showToast({
                                            title: '兑换成功'
                                        });
                                        this.toCash(1);
                                    })
                                }
                            })
                        }
                    }
                })
            },
            requestGoodsOrder(goodsId, goodsSource) {
                this.$u.post('/getConfirmOrderDetails', {
                    goodsId,
                    goodsSource
                }).then(res => {
                    this.loading = false;
                    this.goodsOrderLoadOver = true;
                    this.goodsOrder = res.data;
                    if (this.$common.isNumber(this.goodsOrder.finalPrice)) {
                        this.goodsOrder.finalPrice = parseFloat(this.goodsOrder.finalPrice).toFixed(2);
                        this.goodsOrder.paymentMoney = this.goodsOrder.finalPrice;
                    } else {
                        this.goodsOrder.finalPrice = 0;
                        this.goodsOrder.paymentMoney = 0;
                    }
                    if (this.$common.isNumber(this.goodsOrder.deductionIntegral)) {
                        this.goodsOrder.deductionIntegral = parseFloat(this.goodsOrder.deductionIntegral).toFixed(2);
                    } else {
                        this.goodsOrder.deductionIntegral = 0;
                    }
                    this.originIntegral = this.goodsOrder.deductionIntegral;
                    if (this.originIntegral > 0) {
                        this.isShowIntegral = true;
                    }
                    if (this.$common.isNumber(this.goodsOrder.deductionMoney)) {
                        this.goodsOrder.deductionMoney = parseFloat(this.goodsOrder.deductionMoney).toFixed(2);
                    } else {
                        this.goodsOrder.deductionMoney = 0;
                    }
                    this.originMoney = this.goodsOrder.deductionMoney;
                    if (this.originMoney > 0) {
                        this.isShowMoney = true;
                    }
                });
            },
            requestAddress() {
                this.$u.post('/getAddressList').then(res => {
                    this.addressLoadOver = true;
                    if (this.$common.isNotEmpty(res.data)) {
                        this.address = res.data[0];
                        uni.setStorageSync('address', res.data[0]);
                    }
                })
            },
            deduction(type) {
                if (type == 'integral') {
                    this.isUseIntegral = !this.isUseIntegral;
                    if (this.isUseIntegral) {
                        this.goodsOrder.paymentMoney = (parseFloat(this.goodsOrder.paymentMoney) - parseFloat(this.originIntegral)).toFixed(2);
                        if (!this.isUseMoney && this.originMoney > 0) {
                            this.goodsOrder.deductionMoney = (parseFloat(this.originMoney) - parseFloat(this.originIntegral)).toFixed(2);
                            if (this.goodsOrder.paymentMoney == 0) {
                                this.isShowMoney = false;
                            }
                        }
                    } else {
                        this.goodsOrder.paymentMoney = (parseFloat(this.goodsOrder.paymentMoney) + parseFloat(this.originIntegral)).toFixed(2);
                        if (!this.isUseMoney && this.originMoney > 0) {
                            this.goodsOrder.deductionMoney = parseFloat(this.originMoney).toFixed(2);
                            this.isShowMoney = true;
                        }
                    }
                } else if (type == 'money') {
                    this.isUseMoney = !this.isUseMoney;
                    if (this.isUseMoney) {
                        this.goodsOrder.paymentMoney = (parseFloat(this.goodsOrder.paymentMoney) - parseFloat(this.goodsOrder.deductionMoney)).toFixed(2);
                        if (!this.isUseIntegral) {
                            this.isShowIntegral = false;
                        }
                    } else {
                        this.goodsOrder.paymentMoney = (parseFloat(this.goodsOrder.paymentMoney) + parseFloat(this.goodsOrder.deductionMoney)).toFixed(2);
                        if (!this.isUseIntegral) {
                            this.goodsOrder.deductionMoney = parseFloat(this.originMoney).toFixed(2);
                            this.isShowIntegral = true;
                        }
                    }
                }
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
                        this.toCash(0);
                    }
                })
            },
            toAddress() {
                uni.setStorageSync('isSelectAddress', true);
                this.$u.route('/pages/address/address');
            },
            toCash(index) {
                setTimeout(() => {
                    this.$u.route({
                        type: 'redirect',
                        url: '/pages/cash/cash',
                        params: {
                            index
                        }
                    });
                }, 200);
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .page-container {
        padding: 30rpx $space 150rpx;
    }

    .order-module {
        background: #fff;
        border-radius: 30rpx;
        padding: 30rpx $space;
        &:not(:first-child) {
            margin-top: 25rpx;
        }
    }

    .order-goods {
        margin-top: 0 !important;
        .module-content {
            .goods-picture {
                width: 200rpx;
                height: 200rpx;
                overflow: hidden;
                margin-right: 25rpx;
                border-radius: 20rpx;
            }
            .goods-info {
                @include fontStyle;
            }
            .goods-title {
                @include muchText(2, 40rpx);
            }
            .goods-number {
                @include fontStyle(#aaa, 26rpx);
                text {
                    color: $color;
                    font-weight: bold;
                }
            }
            .goods-amount {
                @include fontStyle(#aaa, 24rpx);
            }
            .goods-price {
                margin-top: 15rpx;
            }
        }
    }

    .order-address {
        padding: 25rpx;
        .address-left {
            margin-right: 20rpx;
            .icon {
                @include fontStyle($color, 50rpx, 50rpx);
            }
        }
        .address-center {
            text-align: left;
            padding-right: 20rpx;
            word-break: break-all;
        }
        .address-name,
        .address-phone {
            @include fontStyle;
        }
        .address-name {
            margin-right: 15rpx;
        }
        .address-detail {
            margin-top: 5rpx;
            @include fontStyle(#aaa, 24rpx, 36rpx);
        }
        .address-right {
            .icon {
                @include fontStyle(#ccc);
            }
        }
    }

    .order-detail {
        padding-top: 20rpx;
        padding-bottom: 20rpx;
        .list {
            .item {
                position: relative;
                padding: 12rpx 0;
                &:last-child {
                    margin-top: 20rpx;
                    padding-top: 25rpx;
                    border-top: 1px solid #eee;
                }
                .item-title {
                    z-index: 10;
                    position: relative;
                    @include fontStyle;
                    text {
                        color: $color;
                        font-weight: bold;
                    }
                }
                .item-number {
                    @include fontStyle(#aaa, 24rpx);
                }
                .item-checkbox {
                    z-index: 5;
                    position: absolute;
                    margin: auto;
                    bottom: 0;
                    right: 0;
                    top: 0;
                }
                .item-content {
                    margin-left: 25rpx;
                    @include fontStyle(#aaa);
                    text {
                        color: $color;
                        font-weight: bold;
                    }
                }
            }
        }
    }

    .goods-button {
        background: #fff;
        padding: 20rpx $space;
        @include pageButtonFixed;
        button {
            height: 80rpx;
            border-radius: 80rpx;
            @include backgroundGradientColor;
            @include fontStyle(#fff, 32rpx, 80rpx);
            &:not(:last-of-type) {
                margin-right: 30rpx;
            }
            &:first-of-type {
                background: #fff;
                border: 1px solid #ddd;
                @include fontStyle(#aaa, 32rpx, calc(80rpx - 2px));
                &.active {
                    background: #f9f9f9;
                }
            }
            text {
                font-size: 26rpx;
                font-weight: bold;
                margin-left: 5rpx;
            }
        }
    }
</style>