<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="通告群" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="annunciate-container">
            <view class="annunciate-title">保存下方二维码，扫码进群</view>
            <view class="annunciate-picture">
                <image class="picture" :src="qrCode" :show-menu-by-longpress="true" mode="aspectFill"></image>
            </view>
            <button class="annunciate-button" @tap="saveQrCode">保存二维码</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            qrCode: 'https://feiyudata.com/profile/banner/2021/11/17/e901bfe826dcf5f85c2070f881123ac6.png'
        }),
        methods: {
            saveQrCode() {
                uni.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                        uni.showLoading({
                            title: '加载中'
                        });
                        uni.downloadFile({
                            url: this.qrCode,
                            success: res => {
                                if (res.statusCode == 200) {
                                    uni.saveImageToPhotosAlbum({
                                        filePath: res.tempFilePath,
                                        success: res => {
                                            uni.showToast({
                                                title: '保存成功'
                                            })
                                            setTimeout(() => {
                                                this.$u.route({
                                                    type: 'back'
                                                });
                                            }, 200);
                                        }
                                    })
                                } else {
                                    uni.showToast({
                                        icon: 'none',
                                        title: '保存失败'
                                    })
                                }
                            },
                            fail: error => {
                                uni.showToast({
                                    icon: 'none',
                                    title: '保存失败'
                                })
                            },
                            complete: () => {
                                setTimeout(() => {
                                    uni.hideLoading();
                                }, 200);
                            }
                        })
                    },
                    fail: error => {
                        if (error.errMsg != 'authorize:fail auth deny') {
                            uni.showModal({
                                title: '提示',
                                content: '小程序需要您的微信授权保存图片，是否重新授权？',
                                success: res => {
                                    if (res.confirm) {
                                        uni.openSetting();
                                    }
                                }
                            })
                        }
                    }
                })
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
        padding: 200rpx 100rpx;
    }

    .annunciate-container {
        text-align: center;
        .annunciate-title {
            @include fontStyle;
        }
        .annunciate-picture {
            width: 300rpx;
            height: 300rpx;
            margin: 30rpx auto 50rpx;
            .picture {
                width: 100%;
                height: 100%;
            }
        }
        .annunciate-button {
            margin: 0 auto;
            height: 60rpx;
            width: 200rpx;
            border-radius: 60rpx;
            background: $gradientColor;
            @include fontStyle(#fff, 24rpx, 60rpx);
        }
    }
</style>