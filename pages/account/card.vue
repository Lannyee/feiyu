<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="我的奖券" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" :is-scroll="false" :list="tabList" :current="tabCurrent" height="90" active-color="#f36e96" :bold="false" bar-width="250" bar-height="4" @change="changeTab"></u-tabs-swiper>
        </view>
        <swiper class="swiper-container flex1" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
            <swiper-item class="swiper-item" v-for="(swiperItem, swiperIndex) in card" :key="swiperIndex">
                <scroll-view scroll-y class="scroll-view" @scrolltolower="onreachBottom(swiperIndex)">
                    <view class="list" v-if="swiperItem.resultList.length > 0">
                        <view :class="{'item': true, 'flex': true, 'disabled': swiperIndex == 2}" v-for="(item, index) in swiperItem.resultList" :key="index">
                            <view class="item-left flex flex-column-center">
                                <view class="item-adorn"></view>
                                <view class="item-left-container">
                                    <view class="item-number"><text>1</text>张</view>
                                    <view class="item-title">{{ item.title }}</view>
                                </view>
                            </view>
                            <view class="item-right flex1 flex flex-column-center">
                                <view class="item-right-container flex1">
                                    <view class="item-title">{{ item.note }}</view>
                                    <view class="item-time">{{ item.validityTerm }}</view>
                                </view>
                                <button class="item-button" @tap="toLottery(item.lotteryId)" :disabled="swiperIndex != 0" hover-class="active">{{ swiperIndex == 0 ? '去抽奖' : swiperIndex == 1 ? '已使用' : '已过期' }}</button>
                            </view>
                        </view>
                    </view>

                    <view class="list-default" v-if="swiperItem.load.isLoadOver && swiperItem.resultList.length == 0">
                        <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                        <view class="default-text">暂无数据</view>
                    </view>
                </scroll-view>
            </swiper-item>
        </swiper>
    </view>
</template>

<script>
    export default {
        data: () => ({
            tabList: [
                {
                    name: '未使用'
                },
                {
                    name: '已使用'
                },
                {
                    name: '已过期'
                }
            ],
            tabCurrent: 0,
            swiperCurrent: 0,
            card: [
                {
                    index: 0,
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
                        lotteryStatus: '0'
                    },
                    refresher: {
                        isClear: true
                    }
                },
                {
                    index: 1,
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
                        lotteryStatus: '1'
                    },
                    refresher: {
                        isClear: true
                    }
                },
                {
                    index: 2,
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
                        lotteryStatus: '2'
                    },
                    refresher: {
                        isClear: true
                    }
                }
            ]
        }),
        onLoad() {
            uni.removeStorageSync('lotteryCardSuccess');
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestCard(this.swiperCurrent);
				}
			}, true);
        },
        onShow() {
            if (uni.getStorageSync('lotteryCardSuccess')) {
                uni.removeStorageSync('lotteryCardSuccess');
                for (let item of this.card) {
                    item.page = {
                        pageNum: 1,
                        pageCount: 0
                    };
                    item.load = {
                        isLoadOver: false,
                        loadStatus: 'loadmore'
                    };
                }
                this.requestCard(this.swiperCurrent);
            }
        },
        methods: {
            changeTab(index) {
                this.swiperCurrent = index;
            },
            transition(e) {
				let dx = e.detail.dx;
				this.$refs.uTabs.setDx(dx);
			},
			animationfinish(e) {
				let current = e.detail.current;
				this.$refs.uTabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.tabCurrent = current;
                if (!this.card[current].load.isLoadOver) {
                    this.requestCard(current);
                }
			},
            onreachBottom(current) {
                this.requestCard(current);
            },
            requestCard(current) {
                this.$common.requestResultRender(this, '/getLotteryList', this.card[current]);
            },
            toLottery(lotteryId) {
                this.$u.route('/pages/lottery/lottery', {
                    lotteryId: lotteryId
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        height: 100vh;
    }

    .swiper-container {
        box-sizing: border-box;
        .swiper-item {
            box-sizing: border-box;
        }
        .scroll-view {
            height: 100%;
            box-sizing: border-box;
        }
        .list {
            padding: 30rpx $space 50rpx;
            .item {
                background: #fff;
                &.disabled {
                    @include filterGrayscale;
                }
                &:nth-child(n+2) {
                    margin-top: 20rpx;
                }
                .item-left {
                    width: 200rpx;
                    height: 160rpx;
                    position: relative;
                    background: linear-gradient(to right, rgba($color, 1) 0%, rgba($color, .5) 100%);
                    .item-adorn {
                        position: absolute;
                        top: -10rpx;
                        left: -5rpx;
                        width: 15rpx;
                        height: 100%;
                        margin-top: 10rpx;
                        background-size: 30rpx 15rpx;
                        background-color: $backgroundColor;
                        background-position: 100% 35%;
                        background-image: linear-gradient(-45deg, rgba($color, 1) 25%, transparent 25%, transparent),
                                        linear-gradient(-135deg, rgba($color, 1) 25%, transparent 25%, transparent),
                                        linear-gradient(-45deg, transparent 75%, rgba($color, 1) 75%),
                                        linear-gradient(-135deg, transparent 75%, rgba($color, 1) 75%);
                    }
                    .item-left-container {
                        width: 100%;
                        text-align: center;
                        padding-top: 10rpx;
                    }
                    .item-number {
                        text-align: center;
                        @include fontStyle(#fff, 36rpx);
                        text {
                            margin-right: 5rpx;
                        }
                    }
                    .item-title {
                        margin-top: 10rpx;
                        @include fontStyle(#fff);
                    }
                }
                .item-right {
                    height: 160rpx;
                    padding: 0 $space;
                    .item-title {
                        @include fontStyle(#666);
                    }
                    .item-time {
                        margin-top: 5rpx;
                        @include fontStyle(#999, 24rpx);
                    }
                    .item-button {
                        background: #fff;
                        margin-left: 30rpx;
                        padding: 0 10rpx;
                        height: 44rpx;
                        border-radius: 5rpx;
                        border: 1px solid $color;
                        @include fontStyle($color, 22rpx, calc(44rpx - 2px));
                        &.active {
                            color: #fff;
                            background: $color;
                        }
                        &[disabled] {
                            border: none;
                            color: #aaa;
                        }
                    }
                }
            }
        }
    }
</style>