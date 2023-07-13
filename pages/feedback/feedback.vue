<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="用户反馈" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="feedback-container">
            <view class="feedback-form">
                <view class="form-list">
                    <view class="item item-textarea">
                        <view class="item-content">
                            <u-input type="textarea" v-model="feedback.text" placeholder="请输入反馈内容(500字以内)" height="200" maxlength="500" :clearable="false" />
                        </view>
                    </view>
                    <view class="item item-feedbackImg flex">
                        <div class="item-left">
                            <view class="item-title">(选填)反馈图片</view>
                            <view class="item-hint">图片上传要求：<br>1.图片格式JPG,PNG<br>2.最多上传3张图片</view>
                        </div>
                        <view class="item-content flex1 flex flex-wrap flex-row-end">
                            <view class="upload-picture" v-for="(item, index) in feedback.feedbackImg" :key="index">
                                <u-image @tap="$common.previewImage(feedback.feedbackImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                                <button @tap="$common.deletePicture(feedback.feedbackImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                                <button @tap="$common.reloadPicture(feedback.feedbackImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                            </view>
                            <view class="upload-button" v-if="feedback.feedbackImg.length < 3">
                                <button @tap="$common.uploadPicture(feedback.feedbackImg, 3)" hover-class="active"><u-icon name="plus"></u-icon></button>
                            </view>
                        </view>
                    </view>
                    
                    <view class="item flex flex-column-center">
                        <view class="item-title">(选填)手机号</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="feedback.phoneNumFeed" placeholder="请输入手机号" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item flex flex-column-center">
                        <view class="item-title">(选填)联系方式</view>
                        <view class="item-content flex1">
                            <u-input type="text" v-model="feedback.wxNumberFeed" placeholder="请输入微信联系方式" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="item item-picture flex">
                        <view class="item-title">(选填)微信二维码</view>
                        <view class="item-content flex1 flex flex-row-end">
                            <view class="upload-picture" v-for="(item, index) in feedback.wxImgFeed" :key="index">
                                <u-image @tap="$common.previewImage(feedback.wxImgFeed, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                                <button @tap="$common.deletePicture(feedback.wxImgFeed, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                                <button @tap="$common.reloadPicture(feedback.wxImgFeed, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                            </view>
                            <view class="upload-button" v-if="feedback.wxImgFeed.length == 0">
                                <button @tap="$common.uploadPicture(feedback.wxImgFeed)" hover-class="active"><u-icon name="plus"></u-icon></button>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <button class="page-button" @tap="$u.throttle(submitFeedback, 500)">提交</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            userInfo: {},
            feedback: {
                text: '',
                feedbackImg: [],
                phoneNumFeed: '',
                wxNumberFeed: '',
                wxImgFeed: []
            }
        }),
        onLoad() {
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.userInfo = data;
				}
			}, true);
        },
        methods: {
            submitFeedback() {
                if (!this.feedback.text) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写反馈内容'
                    })
                    return false;
                }

                if (this.feedback.feedbackImg.length > 0) {
                    if (!this.$common.isPictureUpload(this.feedback.feedbackImg, '反馈图片')) {
                        return false;
                    }
                }

                if (this.feedback.phoneNumFeed) {
                    if (!this.$u.test.mobile(this.feedback.phoneNumFeed)) {
                        uni.showToast({
                            icon: 'none',
                            title: '请填写正确的手机号'
                        })
                        return false;
                    }
                }

                if (this.feedback.wxImgFeed.length > 0) {
                    if (!this.$common.isPictureUpload(this.feedback.wxImgFeed, '微信二维码')) {
                        return false;
                    }
                }

                this.$u.post('/submitFeedback', {
                    customerId: this.userInfo.id,
                    nickName: this.userInfo.nickName,
                    faces: this.userInfo.headImg,
                    phone: this.userInfo.mobile,
                    type: 'XCX',
                    text: this.feedback.text,
                    feedbackImg: this.$common.pictureToString(this.feedback.feedbackImg),
                    phoneNumFeed: this.feedback.phoneNumFeed,
                    wxNumberFeed: this.feedback.wxNumberFeed,
                    wxImgFeed: this.$common.pictureToString(this.feedback.wxImgFeed)
                }).then(res => {
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
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .feedback-container {
        .form-list {
            .item {
                padding: 0 $space;
                min-height: 90rpx;
                background: #fff;
                &:nth-child(n+2) {
                    border-top: 1px solid #eee;
                }
                .item-title {
                    width: 250rpx;
                    @include fontStyle(#444);
                }
            }
            .item-textarea {
                padding: 20rpx $space;
            }
            .item-picture {
                position: relative;
                .item-title {
                    line-height: 90rpx;
                }
                .item-content {
                    padding: 20rpx 0;
                }
            }
            .item-feedbackImg {
                .item-left {
                    padding: 20rpx 0;
                }
                .item-hint {
                    margin-top: 10rpx;
                    @include fontStyle(#aaa, 24rpx, 36rpx);
                }
                .item-content {
                    padding: 20rpx 0;
                    .upload-picture {
                        margin-left: 20rpx;
                        &:nth-child(n+3) {
                            margin-top: 20rpx;
                        }
                    }
                    .upload-button {
                        &:nth-child(2) {
                            margin-left: 20rpx;
                        }
                        &:nth-child(n+3) {
                            margin-top: 20rpx;
                        }
                    }
                }
            }
        }
    }
</style>