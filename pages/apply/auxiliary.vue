<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="辅助说明" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="form-container">
            <view class="form-cause" v-if="auxiliary.refusalCause">拒绝原因：{{ auxiliary.refusalCause }}</view>
            <view class="form-picture">
                <view class="form-title">请上传辅助说明图片</view>
                <view class="form-content">
                    <view class="list flex flex-wrap">
                        <view class="item item-picture flex">
                            <view class="item upload-picture" v-for="(item, index) in auxiliaryPicture" :key="index">
                                <u-image @tap="$common.previewImage(auxiliaryPicture, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                                <button @tap="$common.deletePicture(auxiliaryPicture, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                                <button @tap="$common.reloadPicture(auxiliaryPicture, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                            </view>
                            <view class="item upload-button" v-if="auxiliaryPicture.length == 0">
                                <button @tap="$common.uploadPicture(auxiliaryPicture)" hover-class="active"><u-icon name="plus"></u-icon></button>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="form-hint">
                <view class="form-title">上传辅助说明图片示例</view>
                <view class="form-content">
                    <view class="content-picture">
                        <u-image src="https://feiyudata.com/profile/banner/2021/06/02/a1a13bcfe2a6d6a988184fcdf8b9be55.jpg" width="100%" mode="widthFix"></u-image>
                    </view>
                    <view class="content-detail">说明：上传一张最新的个人主页笔记截图（包含发布笔记后的用户浏览数和点赞数，建议笔记发布后的7-14天后上传）</view>
                </view>
            </view>
            <button class="page-button" @tap="submitAuxiliary">提交</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            applyId: '',
            auxiliary: {},
            auxiliaryPicture: []
        }),
        onLoad(data) {
            uni.removeStorageSync('submitSuccess');
            this.applyId = data.applyId;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestAuxiliary(this.applyId);
				}
			}, true);
        },
        methods: {
            requestAuxiliary(applyId) {
                this.$u.post('/checkAuxiliaryInstructions', {
                    applyId
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.auxiliary = res.data;
                        this.auxiliaryPicture = this.$common.pictureToArray(this.auxiliary.mediaPath);
                    }
                });
            },
            submitAuxiliary() {
                if (this.auxiliaryPicture == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传辅助说明图片'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.auxiliaryPicture, '辅助说明图片')) {
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要提交拍单信息吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/submissionAuxiliaryInstructions', {
                                applyId: this.applyId,
                                content: '辅助说明',
                                mediaPath: this.$common.pictureToString(this.auxiliaryPicture)
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
        padding: 30rpx $space 0;
        .form-cause {
            margin-bottom: 25rpx;
            @include fontStyle(#999);
        }
        .form-title {
            @include fontStyle;
        }
        .form-content {
            margin-top: 20rpx;
        }
        .form-picture {
            .list {
                .item {
                    &:not(:nth-child(4n)) {
                        margin-right: 15rpx;
                    }
                    &:nth-child(n+5) {
                        margin-top: 15rpx;
                    }
                }
                .upload-picture {
                    background: #fff;
                }
                .upload-button {
                    button {
                        background: #fff;
                    }
                }
            }
        }
        .form-hint {
            margin-top: 30rpx;
            .content-detail {
                margin-top: 20rpx;
                @include fontStyle;
            }
        }
    }
</style>