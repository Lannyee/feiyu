<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="登录" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="login-container">
            <view class="logo">
                <u-image src="@/static/images/logo.png" width="100%" mode="widthFix" :show-loading="false"></u-image>
            </view>
            <view class="hint">为了您更好的体验，请您先授权获取您的微信头像及昵称！</view>
            <button class="login-button" v-if="isLogin" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">微信登录</button>
            <button class="login-button" v-else @tap="$u.throttle(getUserProfile, 500)">授权</button>
            <view class="protocol flex-center" v-if="!isLogin">
                <u-checkbox class="checkbox" v-model="isProtocol" icon-size="20" size="30" active-color="#f36e96"></u-checkbox>
                <text @tap="isProtocol = !isProtocol">我已阅读并同意</text>
                <text class="protocol-button" @tap="toRule">《飞鱼用户使用服务协议》</text>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            isLogin: false,
            userInfo: {},
            usertoken: '',
            url: '/pages/home/home',
            params: {},
            isProtocol: false
        }),
        onLoad(data) {
            uni.removeStorageSync('usertoken');
            if (this.$common.isNotEmpty(data.url)) {
                this.url = data.url;
            }
            if (this.$common.isNotEmpty(data.params)) {
                this.params = JSON.parse(data.params);
            }
            if (uni.getStorageSync('userAgreement')) {
                this.isProtocol = true;
            }
        },
        methods: {
            toRule() {
                this.$u.route('/pages/rule/rule', {
                    dataType: 'customer_agreement',
                    ruleTitle: '飞鱼用户使用服务协议'
                });
            },
            getUserProfile() {
                if (!this.isProtocol) {
                    uni.showToast({
                        icon: 'none',
                        title: '请您阅读并同意《飞鱼用户使用服务协议》'
                    })
                    return false;
                }
                uni.getUserProfile({
                    desc: '获取用户基本信息',
                    lang: 'zh_CN',
                    success: res => {
                        uni.showLoading({
                            title: '加载中'
                        });
                        if (res.userInfo) {
                            this.userInfo = res.userInfo;
                            let loginInfo = {
                                encryptedData: res.encryptedData,
                                iv: res.iv
                            }
                            uni.login({
                                success: res => {
                                    this.$u.post('/getLoginInfo', {
                                        code: res.code,
                                        encryptedData: loginInfo.encryptedData,
                                        iv: loginInfo.iv
                                    }).then(res => {
                                        this.usertoken = res.data;
                                        uni.setStorageSync('usertoken', this.usertoken);
                                        this.$u.post('/updateInfo', {
                                            nickName: this.userInfo.nickName,
                                            gender: this.userInfo.gender,
                                            avatarUrl: this.userInfo.avatarUrl,
                                            country: this.userInfo.country,
                                            province: this.userInfo.province,
                                            city: this.userInfo.city
                                        }).then(res => {
                                            this.isLogin = true;
                                            uni.setStorageSync('userAgreement', true);
                                            uni.removeStorageSync('usertoken');
                                        });
                                    });
                                }
                            })
                        }
                    },
                    fail: error => {
                        uni.showToast({
                            icon: 'none',
                            title: '您拒绝授权访问您的个人信息，这将使您无法正常使用本应用！'
                        })
                    }
                })
            },
            getPhoneNumber(e) {
                if (this.$common.isEmpty(e.detail.encryptedData)) {
                    uni.showToast({
                        icon: 'none',
                        title: '您拒绝授权访问您的手机号，这将使您无法正常使用本应用！'
                    })
                } else {
                    uni.setStorageSync('usertoken', this.usertoken);
                    uni.showLoading({
                        title: '加载中'
                    });
                    uni.login({
                        success: res => {
                            if (!this.$common.isNumber(uni.getStorageSync('beforeMoney'))) {
                                uni.setStorageSync('beforeMoney', 0);
                            }
                            this.$u.post('/getPhoneNumber', {
                                code: res.code,
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv
                            }).then(res => {
                                uni.showToast({
                                    title: '登录成功'
                                });
                                setTimeout(() => {
                                    this.$u.route({
                                        type: 'reLaunch',
                                        url: this.url,
                                        params: this.params
                                    })
                                }, 200);
                            });
                        }
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .page-container {
        height: 100vh;
        overflow-y: auto;
        background: #fff;
        padding: 200rpx 30rpx;
    }

    .login-container {
        .logo {
            width: 300rpx;
            margin: 0 auto;
        }
    
        .hint {
            margin: 80rpx 0;
            padding: 0 90rpx;
            @include fontStyle;
        }
    
        .login-button {
            width: 360rpx;
            height: 80rpx;
            margin: 0 auto;
            font-weight: bold;
            border-radius: 80rpx;
            @include fontStyle(#fff, 32rpx, 80rpx);
            @include backgroundGradientColor;
        }

        .protocol {
            margin-top: 30rpx;
            @include fontStyle(#999, 24rpx, 36rpx);
            .checkbox {
                margin-right: 10rpx;
                position: relative;
                top: -1rpx;
            }
            .protocol-button {
                color: $color;
            }
        }
    }
</style>