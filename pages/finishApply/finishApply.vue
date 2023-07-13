<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="历史接单明细" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="finishApply-container">
            <view class="list" v-if="finishApply.resultList.length > 0">
                <view class="item flex flex-column-center" v-for="(item, index) in finishApply.resultList" :key="index">
                    <view class="item-picture">
                        <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                    </view>
                    <view class="item-right flex1">
                        <view class="item-goodsName">{{ item.goodsName }}</view>
                        <view class="item-price flex flex-column-center flex-row-between">
                            <view class="item-number">价格：<text>￥{{ item.price }}</text></view>
                            <view class="item-amount">x1</view>
                        </view>
                        <view class="item-reward flex flex-column-center flex-row-between">
                            <view class="item-number">报价：<text>￥{{ item.rewardMoney || 0 }}</text></view>
                            <view class="item-text">{{ item.tryTypeContent }}</view>
                        </view>
                        <view class="item-time">申请时间：<text class="item-text">{{ item.createTime }}</text></view>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="finishApply.load.isLoadOver && finishApply.resultList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            finishApply: {
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
                    applyStatus: 'finish_status'
                },
                refresher: {
                    isClear: true
                }
            }
        }),
        onLoad() {
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestFinishApply();
				}
			}, true);
        },
        methods: {
            onReachBottom() {
                this.requestFinishApply();
            },
            requestFinishApply() {
                this.$common.requestResultRender(this, '/getTestList', this.finishApply, item => {
                    item.tryTypeContent = this.$common.getTryType(item.tryType, 'content');
                    return item;
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .finishApply-container {
        padding: 30rpx $space 50rpx;
        .list {
            .item {
                padding: 30rpx;
                background: #fff;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-picture {
                    width: 200rpx;
                    height: 200rpx;
                    overflow: hidden;
                    margin-right: 25rpx;
                    border-radius: 20rpx;
                }
                .item-goodsName {
                    @include fontStyle(#333, 26rpx, 36rpx);
                    @include muchText(2, 36rpx);
                }
                .item-number {
                    word-break: break-all;
                    padding-right: 10rpx;
                    text {
                        color: $color;
                        font-weight: bold;
                    }
                }
                .item-amount,
                .item-text {
                    color: #aaa;
                }
                .item-price,
                .item-reward,
                .item-time {
                    margin-top: 10rpx;
                    @include fontStyle(#333, 24rpx, 32rpx);
                }
            }
        }
    }
</style>