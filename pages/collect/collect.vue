<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="我的收藏" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="collect-container">
            <view class="list">
                <view class="item flex flex-column-center" v-for="(item, index) in collect.resultList" :key="index" @tap="toDetail(item, index)">
                    <view class="item-picture">
                        <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                    </view>
                    <view class="item-right flex1">
                        <view class="item-title">
							<image class="platform-icon" :src="item.platformIcon" mode="aspectFill"></image>
							<text class="platform-text">{{ item.goodsName }}</text>
						</view>
                        <view class="item-price flex flex-column-center flex-row-between">
                            <view class="item-number">价格：<text>￥{{ item.currentPrice }}</text></view>
                        </view>
                        <view class="item-apply flex flex-column-center flex-row-between">
                            <view class="item-number">数量：<text>{{ item.applyNum }}</text>份</view>
                            <button class="item-button" @tap.stop="cancelCollect(item.goodsId, index)">取消收藏</button>
                        </view>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="collect.load.isLoadOver && collect.resultList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            collect: {
                resultList: [],
                page: {
                    pageNum: 1,
                    pageCount: 0
                },
                load: {
                    isLoadOver: false,
                    loadStatus: 'loadmore'
                },
                requestParam: {},
                refresher: {
                    isClear: true
                }
            }
        }),
        onLoad() {
            uni.removeStorageSync('reloadCollect');
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestCollect();
				}
			}, true);
        },
        onShow() {
            if (uni.getStorageSync('reloadCollect')) {
                uni.removeStorageSync('reloadCollect');
                this.collect.page = {
                    pageNum: 1,
                    pageCount: 0
                };
                this.collect.load = {
                    isLoadOver: false,
                    loadStatus: 'loadmore'
                };
                this.requestCollect();
            }
        },
        methods: {
            onReachBottom() {
                this.requestCollect();
            },
            requestCollect() {
                this.$common.requestResultRender(this, '/getCollectList', this.collect, item => {
                    item.platformIcon = this.$common.getPlatformLogo(item.label);
                    item.tryTypeContent = this.$common.getTryType(item.tryType, 'content');
                    return item;
                });
            },
            cancelCollect(goodsId, index) {
                uni.showModal({
                    title: '提示',
                    content: '确定要取消收藏吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/addOrDelCollect', {
                                goodsId
                            }).then(res => {
                                uni.showToast({
                                    title: '已取消收藏'
                                })
                                setTimeout(() => {
                                    this.collect.page = {
                                        pageNum: 1,
                                        pageCount: 0
                                    }
                                    this.collect.load = {
                                        isLoadOver: false,
                                        loadStatus: 'loadmore'
                                    }
                                    this.requestCollect();
                                }, 200)
                            });
                        }
                    }
                })
            },
            toDetail(item, index) {
                // goodsSource 商品来源(1: 兑换商品, 2: 卡片, 3: 试用商品)
				this.$u.route('/pages/applyGoods/goodsDetail', {
					goodsId: item.goodsId,
					brandId: item.brandId,
					goodsSource: 3
				});
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .collect-container {
        padding-bottom: 50rpx;
        .list {
            .item {
                background: #fff;
                padding: 25rpx $space;
                &:nth-last-child(n+2) {
                    margin-bottom: 25rpx;
                }
                .item-picture {
                    width: 200rpx;
                    height: 200rpx;
                    overflow: hidden;
                    margin-right: 25rpx;
                    border-radius: 20rpx;
                }
                .item-right {
                    width: 0;
                }
                .item-title {
                    position: relative;
                    .platform-icon {
                        z-index: 5;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    .platform-text {
                        margin: 0;
                        text-indent: 2em;
                        @include fontStyle;
                        @include muchText(2, 40rpx);
                    }
                }
                .item-price {
                    margin-top: 14rpx;
                }
                .item-apply {
                    margin-top: 10rpx;
                }
                .item-number {
                    @include fontStyle(#333, 26rpx);
                    text {
                        color: $color;
                        font-weight: bold;
                    }
                }
                .item-text {
                    @include fontStyle(#aaa, 24rpx);
                }
                .item-button {
                    height: 44rpx;
                    padding: 0 15rpx;
                    border-radius: 44rpx;
                    background: $gradientColor;
                    @include fontStyle(#fff, 22rpx, 44rpx);
                }
            }
        }
    }
</style>