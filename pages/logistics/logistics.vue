<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="物流信息" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="logistics-container">
            <view class="list">
                <view class="item" v-for="(item, index) in logistics" :key="index">
                    <view class="item-time">{{ item.time }}</view>
                    <view class="item-content">{{ item.context }}</view>
                </view>
            </view>

            <view class="list-default" v-if="isLoadOver && logistics.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            logistics: [],
            isLoadOver: false
        }),
        onLoad(data) {
            this.requestLogistics(data.orderId);
        },
        methods: {
            requestLogistics(orderId) {
                this.$u.post('/getLogisticsInfo', {
                    orderId
                }).then(res => {
                    this.isLoadOver = true;
                    if (this.$common.isNotEmpty(res.data)) {
                        this.logistics = res.data;
                    }
                }, error => {
                    this.isLoadOver = true;
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .logistics-container {
        .list {
            padding: 30rpx $space 50rpx;
            .item {
                position: relative;
                padding-left: $space;
                border-left: 1px solid $color;
                &:not(:last-of-type) {
                    padding-bottom: 40rpx;
                }
                &:first-of-type::before {
                    content: '';
                    position: absolute;
                    z-index: 5;
                    top: 0;
                    left: -1px;
                    width: 1px;
                    height: 6rpx;
                    background: $backgroundColor;
                }
                &::after {
                    content: '';
                    position: absolute;
                    z-index: 10;
                    left: -10rpx;
                    top: 6rpx;
                    width: 18rpx;
                    height: 18rpx;
                    border-radius: 50%;
                    background: $color;
                }
                .item-time {
                    font-weight: bold;
                    @include fontStyle(#333, 28rpx, 30rpx);
                }
                .item-content {
                    margin-top: 10rpx;
                    @include fontStyle(#666, 28rpx);
                }
            }
        }
    }
</style>