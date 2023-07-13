<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="拍单信息" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="form-container">
            <view class="form-cause" v-if="auction.refusalCause">拒绝原因：{{ auction.refusalCause }}</view>
            <view class="list">
                <view class="item flex flex-column-center">
                    <view class="item-title">订单号</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="auction.orderNumber" placeholder="请输入订单号" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">物流单号</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="auction.logisticsNumber" placeholder="请输入物流单号" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">实际付款金额</view>
                    <view class="item-content flex1">
                        <u-input type="number" v-model="auction.actualAmount" placeholder="请输入实际付款金额" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item item-picture flex">
                    <view class="item-title">订单截图</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <view class="upload-picture" v-for="(item, index) in auctionPicture" :key="index">
                            <u-image @tap="$common.previewImage(auctionPicture, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                            <button @tap="$common.deletePicture(auctionPicture, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(auctionPicture, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                        <view class="upload-button" v-if="auctionPicture.length == 0">
                            <button @tap="$common.uploadPicture(auctionPicture)" hover-class="active"><u-icon name="plus"></u-icon></button>
                        </view>
                    </view>
                </view>
            </view>
            <button class="page-button" @tap="submitAuction">提交</button>
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
            uni.removeStorageSync('submitSuccess');
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
            },
            submitAuction() {
                if (!this.auction.orderNumber) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入订单号'
                    })
                    return false;
                }

                if (!this.auction.logisticsNumber) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入物流单号'
                    })
                    return false;
                }

                if (this.$common.isNumber(this.auction.actualAmount)) {
                    this.auction.actualAmount = Math.abs(parseFloat(this.auction.actualAmount));
                } else {
                    this.auction.actualAmount = null;
                    uni.showToast({
                        icon: 'none',
                        title: '请输入正确的付款金额'
                    })
                    return false;
                }

                if (this.auctionPicture == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传订单截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.auctionPicture, '订单截图')) {
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要提交拍单信息吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/submissionAuction', {
                                applyId: this.applyId,
                                orderNumber: this.auction.orderNumber,
                                logisticsNumber: this.auction.logisticsNumber,
                                actualAmount: this.auction.actualAmount,
                                mediaPath: this.$common.pictureToString(this.auctionPicture)
                            }).then(res => {
                                uni.setStorageSync('submitSuccess', true);
                                uni.showToast({
                                    title: '提交成功'
                                });
                                setTimeout(() => {
                                    this.$u.route({
                                        type: 'back'
                                    });
                                }, 200);
                            });
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .form-container {
        .form-cause {
            padding: 25rpx $space;
            @include fontStyle(#999);
        }
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
                &.item-picture {
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