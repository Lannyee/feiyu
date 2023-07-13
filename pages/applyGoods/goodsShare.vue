<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="商品分享海报" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <image class="share-banner" :src="shareBanner" :show-menu-by-longpress="true" mode="widthFix"></image>
        <button class="share-button" v-if="isLoadOver" @tap="saveShareBanner">保存</button>
    </view>
</template>

<script>
    export default {
        data: () => ({
            shareBanner: '',
            isLoadOver: false
        }),
        onLoad(data) {
            this.requestShareBanner(data.goodsId, data.goodsSource, JSON.stringify({
                goodsId: data.goodsId,
                brandId: data.brandId,
                goodsSource: data.goodsSource
            }));
        },
        methods: {
            requestShareBanner(goodsId, goodsSource, scene) {
                this.$u.post('/getSharePoster', {
                    goodsId,
                    goodsSource,
                    page: 'pages/applyGoods/goodsDetail',
                    scene
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.isLoadOver = true;
                        this.shareBanner = res.data;
                    } else {
                        uni.showToast({
                            icon: 'none',
                            title: '生成海报失败'
                        })
                        setTimeout(() => {
                            this.$u.route({
                                type: 'back'
                            });
                        }, 200);
                    }
                }, error => {
                    uni.showToast({
                        icon: 'none',
                        title: '生成海报失败'
                    })
                    setTimeout(() => {
                        this.$u.route({
                            type: 'back'
                        });
                    }, 200);
                });
            },
            saveShareBanner() {
                uni.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                        uni.showLoading({
                            title: '加载中'
                        });
                        uni.downloadFile({
                            url: this.shareBanner,
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
        position: relative;
        padding-bottom: 80rpx;
        background-image: linear-gradient(#ed7193, #fb7f7e);
        .share-banner {
            width: 100%;
        }
        .share-button {
            z-index: 10;
            position: fixed;
            bottom: 50rpx;
            left: 0;
            right: 0;
            margin: auto;
            width: 250rpx;
            height: 80rpx;
            background: #fff;
            border-radius: 80rpx;
            box-shadow: 0 0 20rpx rgba(#000, .1);
            @include fontStyle($color, 32rpx, 80rpx);
        }
    }
</style>