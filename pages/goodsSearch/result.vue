<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="搜索结果" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="form-container flex flex-column-center">
            <view class="form-input flex1 flex flex-column-center">
                <u-icon custom-prefix="custom-icon" name="sousuo" class="icon"></u-icon>
                <u-input class="flex1" type="type" v-model="goodsName" placeholder="请输入商品名称" height="70" @confirm="confirmSearch" />
            </view>
            <button class="form-cancel" @tap="$common.navbarGoBack(this)">取消</button>
        </view>

        <view class="result-container flex1">
            <scroll-view scroll-y class="scroll-view" @scrolltolower="requestGoods">
                <view class="list">
                    <button :class="{'item': true, 'flex': true, 'flex-column-center': true, 'disabled': item.goodsStatus == '4'}" v-for="(item, index) in result.resultList" :key="index" @tap="toGoodsDetail(item)">
                        <view class="item-picture">
                            <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill">
                                <u-loading slot="loading"></u-loading>
                            </u-image>
                            <view class="picture-disabled flex-center" v-if="item.goodsStatus == '4'">
                                <image src="@/static/images/img02.png" mode="aspectFit"></image>
                            </view>
                        </view>
                        <view class="item-content flex1">
                            <view class="item-title flex flex-column-center">
                                <image class="platform-icon" :src="item.platformIcon" mode="aspectFill"></image>
                                <text class="platform-text flex1">{{ item.goodsName }}</text>
                            </view>
                            <view class="item-price item-number">
                                价格：<text>￥{{ item.currentPrice }}</text>
                            </view>
                            <view class="item-amount item-number">
                                数量：<text>{{ item.applyNum }}</text>
                            </view>
                            <view class="item-bottom flex flex-column-center flex-row-between">
                                <view class="item-number">
                                    申请人数：<text>{{ item.appliedNum + item.basisApplyNum }}</text>
                                </view>
                                <view :class="{'item-button': true, 'disabled': (item.goodsStatus == '4' || item.goodsStatus == '5')}">{{ item.goodsStatus == '4' ? '已结束' : item.goodsStatus == '5' ? '已申请' : '立即申请' }}</view>
                            </view>
                        </view>
                    </button>
                </view>

                <view class="list-default" v-if="result.load.isLoadOver && result.resultList.length == 0">
                    <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                    <view class="default-text">暂无数据</view>
                </view>
                
                <view class="loadmore" v-else>
                    <u-loadmore :status="result.load.loadStatus" color="#aaa" icon-type="circle" :load-text="loadText" @loadmore="requestGoods" />
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsName: '',
            filterData: {},
            result: {
                resultList: [],
                page: {
                    pageNum: 1,
                    pageCount: 0
                },
                load: {
                    isLoadOver: false,
                    loadStatus: 'loadmore'
                },
                requestParam: {
                    goodsSource: '3',
                    goodsName: ''
                },
                refresher: {
                    isClear: true
                }
            },
            loadText: {
				loadmore: '点击加载更多',
				loading: '努力加载中',
				nomore: '暂时没有更多了'
			}
        }),
        onLoad(data) {
            this.goodsName = data.goodsName;
            this.result.requestParam.goodsName = data.goodsName;
            if (this.$common.isNotEmpty(data.filterData)) {
                this.filterData = JSON.parse(data.filterData);
            }
            Object.assign(this.result.requestParam, this.filterData);
            this.$common.getCustomer(this, () => {
                this.requestGoods();
			})
        },
        onShow() {
            let changeGoods = uni.getStorageSync('changeGoods');
			if (this.$common.isNotEmpty(changeGoods)) {
				uni.removeStorageSync('changeGoods');
				for (let $item of changeGoods) {
					for (let item of this.result.resultList) {
						if (item.goodsId == $item.goodsId) {
							item.goodsStatus = $item.goodsStatus;
							break;
						}
					}
				}
			}
        },
        methods: {
            confirmSearch() {
                if (this.$common.isNotEmpty(this.goodsName)) {
                    this.result.page = {
                        pageNum: 1,
                        pageCount: 0
                    }
                    this.result.load = {
                        isLoadOver: false,
                        loadStatus: 'loadmore'
                    }
                    this.result.requestParam.goodsName = this.goodsName;
                    this.requestGoods();
                    
                    let historySearch = uni.getStorageSync('historySearch');
                    if (this.$common.isNotEmpty(historySearch)) {
                        if (!historySearch.includes(this.goodsName)) {
                            historySearch.unshift(this.goodsName);
                        }
                    } else {
                        historySearch = [this.goodsName];
                    }
                    uni.setStorageSync('historySearch', historySearch);
                }
            },
            requestGoods() {
                this.$common.requestResultRender(this, '/getGoodsList', this.result, item => {
                    item.platformIcon = this.$common.getPlatformLogo(item.label);
                    return item;
                });
            },
            toGoodsDetail(item) {
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
    
    .page-container {
        height: 100vh;
        background: #fff;
    }

    .form-container {
        padding: 30rpx $space;
		.form-input {
			overflow: hidden;
			padding: 0 20rpx;
			position: relative;
			border-radius: 70rpx;
			background: #f2f2f2;
			.icon {
				margin-right: 15rpx;
				@include fontStyle(#aaa, 36rpx);
			}
		}
		.form-cancel {
			width: 70rpx;
			text-align: right;
            @include fontStyle(#666, 28rpx, 70rpx);
		}
	}

    .result-container {
        overflow: hidden;
        .scroll-view {
            height: 100%;
            box-sizing: border-box;
        }
        .list {
            .item {
                padding: 30rpx $space;
				&:nth-child(n+2) {
                    border-top: 1px solid #eee;
				}
				&.disabled {
					.item-picture {
						.picture-container {
							@include filterGrayscale(50%);
						}
					}
					.item-content {
						.item-button {
							background: $disabledColor;
						}
					}
				}
                .item-picture {
                    width: 200rpx;
                    height: 200rpx;
                    margin-right: 25rpx;
                    border-radius: 20rpx;
					position: relative;
                    overflow: hidden;
                    .picture-disabled {
						z-index: 10;
						background: rgba(#000, .5);
						@include positionCenter;
						image {
							width: 70%;
							height: 70%;
						}
					}
                }
                .item-content {
                    width: 0;
                    .item-title {
                        .platform-text {
                            width: 0;
                            text-align: left;
                            @include fontStyle;
                            @include muchText(1, 40rpx);
                        }
                    }
                    .item-number {
                        text-align: left;
                        @include fontStyle(#666, 26rpx);
                        text {
                            color: $color;
                            font-weight: bold;
                        }
                    }
                    .item-price,
                    .item-amount {
                        margin-top: 10rpx;
                    }
                    .item-bottom {
                        margin-top: 6rpx;
                    }
                    .item-button {
                        width: 130rpx;
                        text-align: center;
                        border-radius: 44rpx;
                        @include backgroundGradientColor;
                        @include fontStyle(#fff, 22rpx, 44rpx);
                        &.disabled {
                            background: $disabledColor;
                        }
                    }
                }
			}
        }
        .loadmore {
			padding: 30rpx 0;
		}
    }
</style>