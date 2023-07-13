<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="收款账户绑定" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="bankCard-form">
            <view class="form-title">请根据提示信息，完成收款账户绑定后进行提现</view>
            <view class="form-container">
                <view class="form-input flex flex-column-center">
                    <view class="input-title">姓名</view>
                    <view class="input-content flex1">
                        <u-input type="text" v-model="bankCard.trueName" placeholder="请输入真实姓名" height="90" input-align="right" />
                    </view>
                </view>
                <view class="form-input flex flex-column-center">
                    <view class="input-title">卡号</view>
                    <view class="input-content flex1">
                        <u-input type="text" v-model="bankCard.cardNo" @blur="checkBankCard" placeholder="请输入卡号" height="90" input-align="right" />
                    </view>
                </view>
                <view class="form-input flex flex-column-center">
                    <view class="input-title">开户行</view>
                    <view class="input-content flex1">
                        <u-input type="text" v-model="bankCard.bankName" :disabled="true" placeholder="请选择开户行" height="90" input-align="right" />
                    </view>
                </view>
            </view>
            <button class="page-button" @tap="$u.throttle(addBankCard, 500)">确定</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            bankCard: {
                trueName: '',
                cardNo: '',
                bankName: '',
                cardType: ''
            }
        }),
        methods: {
            checkBankCard() {
                this.bankCard.bankName = '';
                this.bankCard.cardType = '';
                if (this.bankCard.cardNo) {
                    this.$u.post('/checkBankCard', {
                        cardNo: this.bankCard.cardNo
                    }).then(res => {
                        if (this.$common.isNotEmpty(res.data)) {
                            this.bankCard.bankName = res.data.bankName;
                            this.bankCard.cardType = res.data.cardType;
                        }
                    })
                }
            },
            addBankCard() {
                if (!this.bankCard.trueName) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入真实姓名'
                    })
                    return false;
                }

                if (!this.bankCard.cardNo) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入卡号'
                    })
                    return false;
                }

                if (!this.bankCard.bankName || !this.bankCard.cardType) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入正确的卡号'
                    })
                    return false;
                }
                
                this.$u.post('/addOrUpdateCustomerBank', this.bankCard).then(res => {
                    uni.showToast({
                        title: '绑定成功'
                    });
                    setTimeout(() => {
                        let pages = getCurrentPages();
                        let page = pages[pages.length - 2];
                        if (page.route == 'pages/bankCard/bankCard') {
                            page.onLoad();
                            this.$u.route({
                                type: 'back'
                            });
                        } else {
                            uni.setStorageSync('isSelectBankCard', true);
                            this.$u.route({
                                type: 'redirect',
                                url: '/pages/bankCard/bankCard'
                            });
                        }
                    }, 200);
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .bankCard-form {
        .form-title {
            padding: 25rpx $space;
            @include fontStyle(#999);
        }
        .form-input {
            background: #fff;
            padding: 0 $space;
            &:not(:first-of-type) {
                border-top: 1px solid #eee;
            }
            .input-title {
                width: 200rpx;
                @include fontStyle(#444);
            }
        }
    }
</style>