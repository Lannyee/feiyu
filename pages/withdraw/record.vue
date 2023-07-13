<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="提现记录" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" :is-scroll="false" :list="tabList" :current="tabCurrent" height="88" active-color="#f36e96" :bold="false" bar-width="250" bar-height="4" @change="changeTab"></u-tabs-swiper>
        </view>
        <swiper class="swiper-container flex1" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
            <swiper-item class="swiper-item" v-for="(swiperItem, swiperIndex) in record" :key="swiperIndex">
                <scroll-view scroll-y class="scroll-view" @scrolltolower="onreachBottom(swiperIndex)">
                    <view class="list" v-if="swiperItem.resultList.length > 0">
                        <view class="item" v-for="(item, index) in swiperItem.resultList" :key="index">
                            <view class="item-top flex flex-row-between">
                                <view class="item-title">{{ tabList[swiperIndex].name }}</view>
                                <view class="item-number">￥{{ item.actuaArrival || '0' }}</view>
                            </view>
                            <view class="item-bottom">
                                <view class="item-time flex flex-row-between">
                                    <view class="time-title">申请提现时间</view>
                                    <view class="time-content">{{ item.createTime || '-' }}</view>
                                </view>
                                <view class="item-time flex flex-row-between" v-if="item.withdrawalStatus == '3'">
                                    <view class="time-title">提现失败原因</view>
                                    <view class="time-content">{{ item.failureCause }}</view>
                                </view>
                                <view class="item-time flex flex-row-between" v-else>
                                    <view class="time-title">到账时间</view>
                                    <view class="time-content">{{ item.arrivalTime || '暂未到账' }}</view>
                                </view>
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
                    name: '提现中'
                },
                {
                    name: '已到账'
                },
                {
                    name: '提现失败'
                }
            ],
            tabCurrent: 0,
            swiperCurrent: 0,
            record: [
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
                        withdrawalStatus: 1
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
                        withdrawalStatus: 2
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
                        withdrawalStatus: 3
                    },
                    refresher: {
                        isClear: true
                    }
                }
            ]
        }),
        onLoad() {
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestWithdraw(this.swiperCurrent);
				}
			}, true);
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
                if (!this.record[current].load.isLoadOver) {
                    this.requestWithdraw(current);
                }
			},
            onreachBottom(current) {
                this.requestWithdraw(current);
            },
            requestWithdraw(current) {
                this.$common.requestResultRender(this, '/getWithdrawalList', this.record[current]);
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
                border-radius: 15rpx;
                &:nth-child(n+2) {
                    margin-top: 20rpx;
                }
                .item-top {
                    padding: 25rpx $space;
                    .item-title {
                        @include fontStyle(#333, 30rpx);
                    }
                    .item-number {
                        font-weight: bold;
                        @include fontStyle($color);
                    }
                }
                .item-bottom {
                    padding: 25rpx $space 30rpx;
                    border-top: 1px solid #eee;
                    .item-time {
                        @include fontStyle;
                        &:not(:first-of-type) {
                            margin-top: 10rpx;
                        }
                        .time-content {
                            text-align: right;
                            color: #aaa;
                            width: 60%;
                        }
                    }
                }
            }
        }
    }
</style>