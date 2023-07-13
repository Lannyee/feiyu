<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="中奖记录" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="record-container">
            <view class="list" v-if="recordList.length > 0">
                <view class="item flex flex-column-center" v-for="(item, index) in recordList" :key="index">
                    <view class="item-picture">
                        <u-image :src="item.imgPath" width="100%" height="100%" mode="aspectFill"></u-image>
                    </view>
                    <view class="item-right flex1">
                        <view class="item-title">{{ item.prizeName }}</view>
                        <view class="item-time">{{ item.createTime }}</view>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="isLoadOver && recordList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            recordList: [],
            isLoadOver: false
        }),
        onLoad() {
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestRecord();
				}
			}, true);
        },
        methods: {
            requestRecord() {
                this.$u.post('/queryRecord').then(res => {
					this.recordList = res.data;
                    this.isLoadOver = true;
				});
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .record-container {
        .list {
            padding-bottom: 50rpx;
            .item {
                background: #fff;
                padding: 30rpx $space;
                &:nth-child(n+2) {
                    border-top: 1px solid #eee;
                }
                .item-picture {
                    width: 310rpx;
					height: 150rpx;
					overflow: hidden;
					margin-right: 25rpx;
                }
                .item-right {
                    width: 0;
                }
                .item-title {
                    @include fontStyle(#333, 30rpx);
                }
                .item-time {
                    margin-top: 10rpx;
                    @include fontStyle(#aaa, 24rpx);
                }
            }
        }
    }
</style>