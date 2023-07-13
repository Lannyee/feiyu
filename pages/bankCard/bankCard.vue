<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="我的收款账户" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="bankCard-container">
            <view class="list">
                <view class="item flex flex-column-end" v-for="(item, index) in bankCardList" :key="index" @tap="selectBankCard(index)">
                    <view class="item-left flex1">
                        <view class="item-title">{{ item.bankName }}</view>
                        <view class="item-type">{{ item.cardType }}</view>
                        <view class="item-number">{{ item.cardNoEncrypt }}</view>
                    </view>
                    <view class="item-right">
                        <button class="delete-button" @tap.stop="deleteBankCard(item.bankId)">删除</button>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="isLoadOver && bankCardList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
            
            <button class="page-button" @tap="toBankCardBinding">绑定收款账户</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            bankCardList: [],
            isLoadOver: false,
            isSelectBankCard: false
        }),
        onLoad() {
            if (uni.getStorageSync('isSelectBankCard')) {
                uni.removeStorageSync('isSelectBankCard');
                this.isSelectBankCard = true;
            }

            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestBankCard();
				}
			}, true);
        },
        methods: {
            requestBankCard() {
                this.bankCardList = [];
                this.isLoadOver = false;
                this.$u.post('/getBankList').then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        for (let item of res.data) {
                            item.cardNoEncrypt = '**** **** **** ' + item.cardNo.substr(-4, 4);
                            this.bankCardList.push(item);
                        }
                    } else {
                        this.bankCardList = [];
                    }
                    if (!this.isLoadOver) {
                        this.isLoadOver = true;
                    }
                });
            },
            selectBankCard(index) {
                if (this.isSelectBankCard) {
                    uni.setStorageSync('bankCard', this.bankCardList[index]);
                    this.$u.route({
                        type: 'back'
                    });
                }
            },
            deleteBankCard(bankId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要删除该收款账户吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/deleteCustomerBank', {
                                bankId
                            }).then(res => {
                                let bankCard = uni.getStorageSync('bankCard');
                                if (bankCard.bankId == bankId) {
                                    uni.removeStorageSync('bankCard');
                                }
                                uni.showToast({
                                    title: '删除成功'
                                });
                                setTimeout(() => {
                                    this.requestBankCard();
                                }, 200);
                            });
                        }
                    }
                })
            },
            toBankCardBinding() {
                this.$u.route('/pages/bankCard/binding');
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .bankCard-container {
        padding: 30rpx $space 0;
        .list {
            .item {
                padding: 30rpx $space;
                border-radius: 15rpx;
                @include backgroundGradientColor;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-left {
                    .item-title {
                        @include fontStyle(#fff, 30rpx);
                    }
                    .item-type {
                        margin: 10rpx 0 20rpx;
                        @include fontStyle(#fff, 24rpx);
                    }
                    .item-number {
                        font-weight: bold;
                        @include fontStyle(#fff);
                    }
                }
                .item-right {
                    .delete-button {
                        border: 1px solid #fff;
                        height: 44rpx;
                        padding: 0 15rpx;
                        background: none;
                        border-radius: 8rpx;
                        @include fontStyle(#fff, 22rpx, calc(44rpx - 2px));
                    }
                }
            }
        }
    }
</style>