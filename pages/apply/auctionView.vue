<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="拍单信息" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="auction-container">
            <view class="list">
                <view class="item flex flex-column-center">
                    <view class="item-title">订单号</view>
                    <view class="item-content flex1">{{ auction.orderNumber }}</view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">物流单号</view>
                    <view class="item-content flex1">{{ auction.logisticsNumber }}</view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">实际付款金额</view>
                    <view class="item-content flex1">{{ auction.actualAmount }}</view>
                </view>
                <view class="item item-picture flex">
                    <view class="item-title">订单截图</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <view class="upload-picture" v-for="(item, index) in auctionPicture" :key="index">
                            <u-image @tap="$common.previewImage(auctionPicture, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            applyId: '',
            auction: {},
            auctionPicture: []
        }),
        onLoad(data) {
            this.applyId = data.applyId;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestAuction(this.applyId);
				}
			}, true);
        },
        methods: {
            requestAuction(applyId) {
                this.$u.post('/checkAuction', {
                    applyId
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.auction = res.data;
                        this.auctionPicture = this.$common.pictureToArray(this.auction.mediaPath);
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .auction-container {
        padding-bottom: 50rpx;
        .list {
            background: #fff;
            .item {
                padding: 0 $space;
                min-height: 90rpx;
                &:nth-child(n+2) {
                    border-top: 1px solid #eee;
                }
                .item-title {
                    width: 200rpx;
                    @include fontStyle(#444);
                }
                .item-content {
                    width: 0;
                    text-align: right;
                    @include oneText;
                }
                &.item-picture {
                    height: auto;
                    .item-title {
                        line-height: 90rpx;
                    }
                    .item-content {
                        padding: 20rpx 0;
                    }
                }
            }
        }
    }
</style>