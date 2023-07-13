<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="商品详情" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="goods-picture">
            <view class="swiper-container">
				<u-swiper :list="goodsDetail.imgCarouselList" height="750" mode="number" indicator-pos="bottomRight" interval="5000" border-radius="0" @click="previewImage"></u-swiper>
			</view>
        </view>

        <view class="goods-info u-skeleton">
            <view class="goods-title u-skeleton-fillet">{{ goodsDetail.goodsName }}</view>
            <view class="goods-middle flex flex-column-center u-skeleton-fillet">
                <view class="goods-price">
                    <text>￥{{ goodsDetail.currentPrice }}</text>
                </view>
                <view class="goods-number">
                    数量：<text>{{ goodsDetail.applyNum }}</text>
                </view>
            </view>
        </view>

		<u-skeleton :loading="!isLoadOver" :animation="true"></u-skeleton>

        <view class="goods-module goods-brand" v-if="brandDetail.brandId">
            <view class="module-title flex-center">
                <icon></icon>
                <icon></icon>
                <text>品牌介绍</text>
                <icon></icon>
                <icon></icon>
            </view>
            <view class="brand-info flex flex-column-center">
                <view class="brand-picture">
                    <u-image :src="brandDetail.brandLogo" width="100%" mode="widthFix"></u-image>
                </view>
                <view class="brand-name">{{ brandDetail.brandName }}</view>
            </view>
            <view class="module-content">
                <u-parse :html="brandDetail.introduce"></u-parse>
            </view>
        </view>

        <view class="goods-module goods-detail" v-if="isLoadOver">
            <view class="module-title flex-center">
                <icon></icon>
                <icon></icon>
                <text>商品详情</text>
                <icon></icon>
                <icon></icon>
            </view>
            <view class="module-content">
                <u-parse :html="goodsDetail.details" :lazy-load="true"></u-parse>
            </view>
        </view>

        <view class="goods-button" v-if="isLoadOver">
            <view class="flex">
                <view class="goods-share">
                    <button open-type="share">
                        <u-icon name="share"></u-icon>
                    </button>
                </view>
                <view class="goods-apply flex1">
                    <button @tap="applyGoods">立即兑换</button>
                </view> 
            </view>
        </view>

        <u-back-top :scroll-top="scrollTop" icon="arrow-up" z-index="999" right="30" bottom="160" :custom-style="{background: '#f36e96'}" :icon-style="{color: '#fff'}"></u-back-top>
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsId: '',
            goodsSource: '',
            brandId: '',
            goodsDetail: {},
            brandDetail: {},
            isLoadOver: false,
            scrollTop: 0
        }),
        onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
        onLoad(data) {
            this.goodsId = data.goodsId;
            this.goodsSource = data.goodsSource;
            this.brandId = data.brandId;
            this.$common.getCustomer(this, () => {
                this.requestGoodsDetail(this.goodsId, this.goodsSource);
                this.requestBrandDetail(this.brandId);
            })
        },
        methods: {
            previewImage(index) {
                this.$common.previewImage(this.goodsDetail.imgCarouselList, index, false);
            },
            applyGoods() {
                this.checkLogin(() => {
                    // goodsSource 商品来源(1: 试用商品, 2: 兑换商品, 3: 中奖商品)
                    this.$u.route('/pages/cashGoods/goodsOrder', {
                        goodsId: this.goodsDetail.goodsId,
                        goodsSource: 2
                    });
                })
            },
            requestGoodsDetail(goodsId, goodsSource) {
                this.$u.post('/getGoodsDetails', {
                    goodsId,
                    goodsSource
                }).then(res => {
                    this.isLoadOver = true;
                    this.goodsDetail = res.data;
                });
            },
            requestBrandDetail(brandId) {
                this.$u.post('/getBrandDetails', {
                    brandId
                }).then(res => {
                    this.brandDetail = res.data;
                });
            },
            checkLogin(callBack) {
                let params = {
					goodsId: this.goodsDetail.goodsId,
					brandId: this.goodsDetail.brandId,
					goodsSource: 1
				}
				this.$common.checkLogin(this, '/pages/cashGoods/goodsDetail', params, () => {
                    callBack && callBack()
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        padding-bottom: 120rpx;
    }

    .goods-info {
        background: #fff;
        padding: 25rpx $space 30rpx;
        .goods-title {
            font-weight: bold;
            @include fontStyle(#333, 32rpx, 48rpx);
        }
        .goods-middle {
            margin-top: 15rpx;
        }
        .goods-price {
            font-weight: bold;
            margin-right: 20rpx;
            @include fontStyle($color, 36rpx);
        }
        .goods-number {
            @include fontStyle(#aaa, 24rpx);
            text {
                color: $color;
                font-weight: bold;
            }
        }
    }

    .goods-module {
        margin-top: 25rpx;
        background: #fff;
        padding: 30rpx $space;
        .module-title {
            font-weight: bold;
            @include fontStyle;
            icon {
                width: 10rpx;
                height: 10rpx;
                margin: 0 5rpx;
                background: $color;
                transform: rotateZ(45deg);
            }
            text {
                margin: 0 10rpx;
            }
        }
        .module-content {
            margin-top: 25rpx;
            @include parseContent;
        }
        &.goods-brand {
            .brand-info {
                margin-top: 25rpx;
                .brand-name {
                    @include fontStyle;
                    margin-left: 20rpx;
                }
                .brand-picture {
                    width: 200rpx;
                }
            }
        }
        &.goods-detail {
            padding: 30rpx 0;
        }
    }

    .goods-button {
        background: #fff;
        padding: 20rpx $space;
        animation: buttonMove .3s;
        @include pageButtonFixed;
        .goods-share {
            button {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                @include backgroundGradientColor;
                @include fontStyle(#fff, 44rpx, 80rpx);
            }
        }
        .goods-apply {
            button {
                height: 80rpx;
                margin-left: 30rpx;
                border-radius: 80rpx;
                @include backgroundGradientColor;
                @include fontStyle(#fff, 32rpx, 80rpx);
                &[disabled] {
                    background: $disabledColor;
                }
            }
        }
    }
    @keyframes buttonMove {
        0% {
            opacity: 0;
            bottom: -120rpx;
        }
        100% {
            opacity: 1;
            bottom: 0;
        }
    }
</style>