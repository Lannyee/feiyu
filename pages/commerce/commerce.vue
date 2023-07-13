<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="商务合作" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="commerce-container">
            <view class="commerce-form">
                <view class="form-hint"><text>飞鱼数据</text>等待您的加入，请填写下表，我们将会在工作日24小时内与您联系</view>
                <view class="form-list">
                    <view class="item flex flex-column-center">
                        <view class="item-title">品牌名称</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.brandName" placeholder="请输入品牌名称" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">公司名称</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.companyName" placeholder="请输入公司名称" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">联系人</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.contacts" placeholder="请输入联系人姓名" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">手机号</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.phone" placeholder="请输入手机号" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">邮箱</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.email" placeholder="请输入邮箱" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">联系方式</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="commerce.wechat" placeholder="请输入微信联系方式" height="90" input-align="right" />
                        </view>
                    </view>
                </view>
                <view class="form-hint"><text>温馨提示：</text>您可选择一种或多种联系方式进行填写</view>
            </view>
            <button class="page-button" @tap="addCooperation">提交信息</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            commerce: {
                brandName: '',
                companyName: '',
                contacts: '',
                phone: '',
                email: '',
                wechat: ''
            }
        }),
        methods: {
            addCooperation() {
                if (!this.commerce.brandName || !this.commerce.companyName || !this.commerce.contacts || !this.commerce.phone || !this.commerce.email || !this.commerce.wechat) {
                    uni.showToast({
                        icon: 'none',
                        title: '请完善信息'
                    })
                    return false;
                }

                if (!this.$u.test.mobile(this.commerce.phone)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的手机号'
                    })
                    return false;
                }

                if (!this.$u.test.email(this.commerce.email)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的邮箱'
                    })
                    return false;
                }

                this.$u.post('/addCooperation', {
                    brandName: this.commerce.brandName,
                    companyName: this.commerce.companyName,
                    contacts: this.commerce.contacts,
                    phone: this.commerce.phone,
                    email: this.commerce.email,
                    wechat: this.commerce.wechat
                }).then(res => {
                    uni.showToast({
                        title: '提交成功'
                    });
                    setTimeout(() => {
                        this.$u.route({
                            type: 'back'
                        });
                    }, 200);
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .commerce-container {
        .commerce-form {
            .form-hint {
                padding: 25rpx $space;
                @include fontStyle(#999);
                text {
                    color: $color;
                }
            }
            .form-list {
                .item {
                    background: #fff;
                    padding: 0 $space;
                    &:not(:first-of-type) {
                        border-top: 1px solid #eee;
                    }
                    .item-title {
                        width: 200rpx;
                        @include fontStyle(#444);
                    }
                }
            }
        }
    }
</style>