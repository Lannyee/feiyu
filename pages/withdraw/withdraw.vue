<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="鱼币提现" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>
        
        <view class="order-form" v-if="orderList.length > 0">
            <view class="order-title flex flex-column-center flex-row-between">
                <text>选择商品</text>
                <button :class="{'active': isSelectAll}" @tap="allChange(false)">{{ isSelectAll ? '取消全选' : '全选' }}</button>
            </view>
            <view class="order-list">
                <view class="item flex flex-row-between flex-column-center" v-for="(item, index) in orderList" :key="index" @tap="itemChange(index)">
                    <view class="item-left flex flex-column-center">
                        <view class="item-picture">
                            <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                        </view>
                        <view class="item-goodsName flex1">{{ item.goodsName }}</view>
                    </view>
                    <view class="item-right flex flex-column-center flex-row-end">
                        <view :class="{'item-price': true, 'active': item.isSelect}">￥{{ item.value }}</view>
                        <view class="item-checkbox flex-center"><u-checkbox v-model="item.isSelect" shape="circle" size="36" icon-size="20" active-color="#f36e96"></u-checkbox></view>
                    </view>
                </view>
            </view>
        </view>

        <view class="withdraw-form">
            <view class="form-top">
                <view class="form-title">提现金额</view>
                <view class="form-input">
                    <view class="input-icon flex flex-column-center">
                        <u-icon name="rmb"></u-icon>
                    </view>
                    <view class="input-content">
                        <u-input :disabled="true" v-model="withdrawMoney" @blur="blurWithdraw" type="number" height="80" :placeholder="'提现金额最低为￥' + minMoney" />
                    </view>
                </view>
                <view class="form-hint" v-show="isWithdrawHint">{{ withdrawHint }}</view>
            </view>
            <view class="form-bottom flex flex-column-center flex-row-between">
                <view class="form-fee">手续费：<text>￥{{ fee }}</text></view>
                <view class="form-money flex flex-column-center">可提现：<text>￥{{ money }}</text><button @tap="allChange(true)">全部提现</button></view>
            </view>
        </view>

        <view class="bankCard-form" v-show="isNeedBankCardNo">
            <button class="form-input flex flex-column-center" hover-class="active" @tap.capture="toBankCard">
                <view class="input-title">收款账户</view>
                <view class="input-content flex1">
                    <u-input v-model="bankCardNo" :disabled="true" type="number" height="90" placeholder="请选择收款账户" />
                </view>
                <u-icon class="form-icon" name="arrow-right"></u-icon>
            </button>
            <view class="form-bottom flex flex-row-end">
                <view class="form-hint flex flex-column-center">未绑卡？<button @tap="toBankCardBinding">去绑定</button></view>
            </view>
        </view>

        <button class="withdraw-button" :disabled="!isWithdrawButton" @tap="$u.throttle(confirmWithdraw, 500)">提现</button>
    </view>
</template>

<script>
    export default {
        data: () => ({
			selectMoney:0,
            money: 0, //鱼币余额
            minMoney: 1, //零钱最低提现
            maxMoney: 1000, //银行卡最低提现
            point: 0, //提现税点
            fee: 0, //提现手续费
            withdrawMoney: null, //提现金额
            isWithdrawButton: false, //是否可以提现
            isWithdrawHint: false, //是否展示提示文字
            withdrawHint: '', //提示文字
            isNeedBankCardNo: false, //是否需要银行卡号
            bankCardId: null, //银行卡ID
            bankCardNo: null, //银行卡号
            orderList: [], //可提现订单
            isSelectAll: false //是否全选
        }),
        onLoad() {
            uni.removeStorageSync('bankCard');
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    if (this.$common.isNumber(data.money)) {
                        this.money = parseFloat(data.money);
                        if (this.money < 0) {
                            uni.showModal({
                                title: '提示',
                                content: '您的鱼币存在异常，不能提现',
                                showCancel: false,
                                success: res => {
                                    this.$u.route({
                                        type: 'back'
                                    });
                                }
                            })
                            return false;
                        }
                    }
                    
                    this.requestPoint();
                    this.requestMinMoney();
                    this.requestMaxMoney();
                    this.requestOrderList();
				}
			}, true);
        },
        onShow() {
            let bankCard = uni.getStorageSync('bankCard');
            if (this.$common.isNotEmpty(bankCard)) {
                this.bankCardId = bankCard.bankId;
                this.bankCardNo = bankCard.cardNo;
            } else {
                this.bankCardId = null;
                this.bankCardNo = null;
            }
        },
        watch:{
            withdrawMoney(value) {
                if (this.$common.isNumber(value)) {
                    if (parseFloat(value) < this.minMoney) {
                        this.isWithdrawHint = true;
                        this.isWithdrawButton = false;
                        this.withdrawHint = '提现金额最低为￥' + this.minMoney;
                    } else {
                        this.isWithdrawHint = false;
                        this.isWithdrawButton = true;
                        if (parseFloat(value) > this.money) {
                            this.isWithdrawHint = true;
                            this.isWithdrawButton = false;
                            this.withdrawHint = '可提现金额只有￥' + this.money;
                        }
                    }

                    if (parseFloat(value) >= this.maxMoney) {
                        this.isNeedBankCardNo = true;
                    } else {
                        this.isNeedBankCardNo = false;
                    }

                    this.fee = (parseFloat(value).toFixed(2) * this.point).toFixed(2);
                } else {
                    this.isWithdrawHint = false;
                    this.isNeedBankCardNo = false;
                    this.isWithdrawButton = false;
                    this.fee = 0;
                }
            }
        },
        methods: {
            itemChange(index) {
                let isSelect = this.orderList[index].isSelect;
                this.orderList[index].isSelect = !isSelect;
                let isSelectAll = true;
                for (let item of this.orderList) {
                    if (!item.isSelect) {
                        isSelectAll = false;
                        break;
                    }
                }
                this.isSelectAll = isSelectAll;
                this.renderWithdrawMoney();
            },
			allChange(isSelectAll) {
                if (isSelectAll) {
                    this.isSelectAll = true;
                } else {
                    this.isSelectAll = !this.isSelectAll;
                }
                for (let item of this.orderList) {
                    if (this.isSelectAll) {
                        item.isSelect = true;
                    } else {
                        item.isSelect = false;
                    }
                }
                this.renderWithdrawMoney();
			},
            renderWithdrawMoney() {
                let withdrawMoney = 0;
                for (let item of this.orderList) {
                    if (item.isSelect) {
                        withdrawMoney += item.value;
                    }
                }
                if (withdrawMoney > 0) {
                    this.withdrawMoney = withdrawMoney;
                } else {
                    this.withdrawMoney = null;
                }
            },
            requestPoint() {
                this.$u.post('/getRuleContent', {
                    groupCode: 'sys',
                    dataType: 'tax_point'
                }).then(res => {
                    if (this.$common.isNumber(res.data)) {
                        if (res.data.indexOf('%')) {
                            this.point = parseFloat(res.data) / 100;
                        } else {
                            this.point = parseFloat(res.data);
                        }
                    }
                });
            },
            requestMinMoney() {
                this.$u.post('/getRuleContent', {
                    groupCode: 'sys',
                    dataType: 'withdrawal_min'
                }).then(res => {
                    if (this.$common.isNumber(res.data)) {
                        this.minMoney = parseFloat(res.data);
                    }
                });
            },
            requestMaxMoney() {
                this.$u.post('/getRuleContent', {
                    groupCode: 'sys',
                    dataType: 'withdrawal_to_card_min'
                }).then(res => {
                    if (this.$common.isNumber(res.data)) {
                        this.maxMoney = parseFloat(res.data);
                    }
                });
            },
            requestOrderList() {
                this.$u.post('/getMoneyByOrderList').then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        for (let item of res.data) {
                            item.isSelect = false;
                            item.value = parseFloat(item.value);
                            if (item.delFlag != '0') {
                                item.goodsName = '悬赏结算';
                                item.imgThumbnail = 'https://feiyudata.com/profile/prizeImg/2020/04/29/998fffeb3e365c4cdfb6e8574789aca9.jpg';
                            }
                            this.orderList.push(item);
                        }
                    }
                    if (this.$common.isEmpty(this.orderList)) {
                        uni.showModal({
                            title: '提示',
                            content: '您的鱼币存在异常，不能提现',
                            showCancel: false,
                            success: res => {
                                this.$u.route({
                                    type: 'back'
                                });
                            }
                        })
                    }
                });
            },
            blurWithdraw() {
                if (this.$common.isNumber(this.withdrawMoney)) {
                    this.withdrawMoney = parseFloat(parseFloat(this.withdrawMoney).toFixed(2));
                } else {
                    this.withdrawMoney = null;
                }
            },
            confirmWithdraw() {
                if (this.$common.isNumber(this.withdrawMoney)) {
                    if (this.isWithdrawHint) {
                        uni.showToast({
                            icon: 'none',
                            title: '提现金额最低为￥' + this.minMoney
                        })
                        return false;
                    }

                    if (parseFloat(this.withdrawMoney) > this.money) {
                        uni.showToast({
                            icon: 'none',
                            title: '可提现金额只有￥' + this.money
                        })
                        return false;
                    }

                    if (this.isNeedBankCardNo && this.$common.isEmpty(this.bankCardNo)) {
                        uni.showToast({
                            icon: 'none',
                            title: '请选择银行卡账号'
                        })
                        return false;
                    }

                    let requestParam = {};
                    let withdraw = [];
                    for (let item of this.orderList) {
                        if (item.isSelect) {
                            withdraw.push({
                                orderId: item.orderId,
                                money: item.value
                            })
                        }
                    }
                    if (this.isNeedBankCardNo) {
                        requestParam = {
                            type: '1',
                            money: this.withdrawMoney,
                            bankId: this.bankCardId,
							withdraw: JSON.stringify(withdraw)
                        }
                    } else {
                        requestParam = {
                            type: '2',
                            money: this.withdrawMoney,
							withdraw: JSON.stringify(withdraw)
                        }
                    }
                    
                    uni.showModal({
                        title: '提示',
                        content: '确定要提现鱼币吗？',
                        success: res => {
                            if (res.confirm) {
                                this.$u.post('/withdrawalToBankCard', requestParam).then(res => {
                                    uni.setStorageSync('withdrawalSuccess', true);
                                    if (this.$common.isNumber(uni.getStorageSync('beforeMoney'))) {
                                        let beforeMoney = parseFloat(uni.getStorageSync('beforeMoney'));
                                        uni.setStorageSync('beforeMoney', beforeMoney - parseFloat(this.withdrawMoney));
                                    }
                                    this.$common.getTemplate(this, 'withdraw', () => {
                                        uni.showToast({
                                            title: res.msg
                                        });
                                        setTimeout(() => {
                                            this.$u.route({
                                                type: 'back'
                                            });
                                        }, 200);
                                    })
                                })
                            }
                        }
                    })
                } else {
                    this.withdrawMoney = null;
                    uni.showToast({
                        icon: 'none',
                        title: '请输入正确的提现金额'
                    })
                    return false;
                }
            },
            toBankCard() {
                uni.setStorageSync('isSelectBankCard', true);
                this.$u.route('/pages/bankCard/bankCard');
            },
            toBankCardBinding() {
                this.$u.route('/pages/bankCard/binding');
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        padding-bottom: 50rpx;
    }

    .order-form {
        background: #fff;
        margin-bottom: 20rpx;
        padding: 0 $space;
        .order-title {
            padding: 25rpx 0;
            text {
                @include fontStyle(#333, 30rpx);
            }
            button {
                @include fontStyle;
                &.active {
                    color: $color;
                }
            }
        }
        .order-list {
            .item {
                border-top: 1px solid #eee;
                padding: 25rpx 0;
                .item-left {
                    width: 70%;
                }
                .item-picture {
                    width: 120rpx;
                    height: 120rpx;
                    overflow: hidden;
                    margin-right: 20rpx;
                    border-radius: 10rpx;
                }
                .item-goodsName {
                    width: 0;
                    @include fontStyle;
                    @include muchText(2, 40rpx, 0);
                }
                .item-right {
                    width: 25%;
                    position: relative;
                }
                .item-price {
                    z-index: 10;
                    position: relative;
                    padding-right: 50rpx;
                    @include fontStyle(#666);
                    &.active {
                        font-weight: bold;
                        color: $color;
                    }
                }
                .item-checkbox {
                    width: 40rpx;
                    height: 40rpx;
                    position: absolute;
                    z-index: 5;
                    top: -1px;
                    right: 0;
                }
            }
        }
    }
    
    .withdraw-form {
        background: #fff;
        .form-top {
            padding: 30rpx $space 25rpx;
        }
        .form-title {
            @include fontStyle(#333, 30rpx);
        }
        .form-input {
            margin-top: 20rpx;
            position: relative;
            .input-icon {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 80rpx;
                @include fontStyle($color, 40rpx, 80rpx);
            }
            .input-content {
                padding-left: 60rpx;
            }
        }
        .form-hint {
            @include fontStyle(red, 24rpx);
        }
        .form-bottom {
            @include fontStyle(#444, 24rpx);
            border-top: 1px solid #eee;
            padding: 20rpx $space;
            text {
                color: $color;
            }
            button {
                @include backgroundGradientColor;
                margin-left: 15rpx;
                padding: 0 15rpx;
                height: 44rpx;
                border-radius: 44rpx;
                @include fontStyle(#fff, 22rpx, 44rpx);
            }
        }
    }

    .bankCard-form {
        margin-top: 20rpx;
        .form-input {
            padding: 0 $space;
            background: #fff;
            &.active {
                background: #f9f9f9;
            }
            .input-title {
                @include fontStyle;
                margin-right: 50rpx;
            }
            .input-content {
                padding-right: 30rpx;
            }
            .form-icon {
                @include fontStyle(#cdcdcd, 32rpx);
            }
        }
        .form-bottom {
            padding: 0 $space;
            margin-top: 15rpx;
            .form-hint {
                @include fontStyle(#666, 24rpx);
                button {
                    color: $color;
                }
            }
        }
    }

    .withdraw-button {
        margin: 50rpx auto 0;
        width: calc(100% - 100rpx);
        border-radius: 90rpx;
        letter-spacing: 5rpx;
        font-weight: bold;
        height: 90rpx;
        @include backgroundGradientColor;
        @include fontStyle(#fff, 32rpx, 90rpx);
        &[disabled] {
            color: #fff;
            background: $disabledColor;
        }
    }
</style>