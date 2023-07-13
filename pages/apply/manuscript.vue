<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="初稿信息" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="form-container">
            <view class="form-cause" v-if="manuscript.refusalCause">拒绝原因：{{ manuscript.refusalCause }}</view>
            <view class="form-picture" v-if="manuscriptType == '1'">
                <view class="form-title">请上传稿件图片<button hover-class="active" @tap="deleteAllPicture" v-if="manuscriptPicture.length > 3">全部删除</button></view>
                <view class="form-content">
                    <view class="list flex flex-wrap">
                        <view class="item upload-picture" v-for="(item, index) in manuscriptPicture" :key="index">
                            <u-image @tap="$common.previewImage(manuscriptPicture, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                            <button @tap="$common.deletePicture(manuscriptPicture, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(manuscriptPicture, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                        <view class="item upload-button">
                            <button @tap="$common.uploadPicture(manuscriptPicture, 9)" hover-class="active"><u-icon name="plus"></u-icon></button>
                        </view>
                    </view>
                </view>
            </view>

            <view class="form-video" v-else-if="manuscriptType == '2'">
                <view class="form-title">请上传稿件视频</view>
                <view class="form-content">
                    <view class="list">
                        <view class="item" v-for="(item, index) in manuscriptPicture" :key="index">
                            <video class="video" :src="item.url"></video>
                            <button @tap="$common.deletePicture(manuscriptPicture, index, true)" class="video-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(manuscriptPicture, index)" class="video-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                    </view>
                    <view class="upload-button" v-if="manuscriptPicture.length == 0">
                        <button @tap="$common.uploadVideo(manuscriptPicture)" hover-class="active"><u-icon name="plus"></u-icon></button>
                    </view>
                </view>
            </view>

            <view class="form-editor">
                <view class="form-title">请输入稿件内容</view>
                <view class="form-content">
                    <view class="editor-container">
                        <editor id="editor" class="editor" @ready="onEditorReady" :data-placeholder="editorPlaceholder" @input="editorInput"></editor>
                    </view>
                </view>
            </view>

            <view class="rule-container">
                <view class="rule-title">申请要求</view>
                <view class="rule-content">
                    <u-parse :html="goodsDetail.testRequire"></u-parse>
                </view>
            </view>

            <button class="page-button" @tap="submitManuscript">提交</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            applyId: '',
            manuscriptType: '',
            goodsId: '',
            goodsSource: '',
            goodsDetail: {},
            manuscript: {},
            manuscriptHtml: '',
            manuscriptText: '',
            manuscriptPicture: [],
            editorPlaceholder: '请输入稿件内容'
        }),
        onLoad(data) {
            uni.removeStorageSync('submitSuccess');
            this.applyId = data.applyId;
            this.manuscriptType = data.manuscriptType;
            this.goodsId = data.goodsId;
            this.goodsSource = data.goodsSource;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestGoodsDetail(this.goodsId, this.goodsSource);
				}
			}, true);
        },
        methods: {
            deleteAllPicture() {
                uni.showModal({
                    title: '提示',
                    content: '确定要删除所有图片吗？',
                    success: res => {
                        if (res.confirm) {
                            this.manuscriptPicture = [];
                        }
                    }
                })
            },
            onEditorReady() {
                this.requestManuscript(this.applyId, () => {
                    if (this.manuscriptHtml) {
                        this.editorPlaceholder = '';
                    }
                    uni.createSelectorQuery().select('#editor').context(res => {
                        this.editorCtx = res.context;
                        this.editorCtx.setContents({
                            html: this.manuscriptHtml
                        })
                    }).exec();
                });
            },
            editorInput(e) {
                this.manuscriptHtml = e.detail.html;
                this.manuscriptText = e.detail.text;
                if (this.$common.isEmpty(e.detail.text) || e.detail.text == '\n') {
                    this.manuscriptText = '';
                    this.editorPlaceholder = '请输入稿件内容';
                } else {
                    this.editorPlaceholder = '';
                }
            },
            requestGoodsDetail(goodsId, goodsSource) {
                this.$u.post('/getGoodsDetails', {
                    goodsId,
                    goodsSource
                }).then(res => {
                    this.goodsDetail = res.data;
                });
            },
            requestManuscript(applyId, callBack) {
                this.$u.post('/checkManuscript', {
                    applyId
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.manuscript = res.data;
                        this.manuscriptPicture = this.$common.pictureToArray(this.manuscript.mediaPath);
                        this.manuscriptHtml = this.manuscript.content;
                        this.manuscriptText = this.manuscript.content;
                    }
                    callBack && callBack();
                });
            },
            submitManuscript() {
                let toastText = '';
                if (this.manuscriptType == '1') {
                    toastText = '稿件图片';
                } else if (this.manuscriptType == '2') {
                    toastText = '稿件视频';
                }

                if (this.manuscriptPicture.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传' + toastText
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.manuscriptPicture, toastText)) {
                    return false;
                }

                if (!this.manuscriptText) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入稿件内容'
                    })
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要提交稿件吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/submissionManuscript', {
                                applyId: this.applyId,
                                content: this.manuscriptHtml,
                                mediaPath: this.$common.pictureToString(this.manuscriptPicture)
                            }).then(res => {
                                uni.setStorageSync('submitSuccess', true);
                                this.$common.getTemplate(this, 'manuscript', () => {
                                    uni.showToast({
                                        title: '提交成功'
                                    });
                                    setTimeout(() => {
                                        this.$u.route({
                                            type: 'back'
                                        });
                                    }, 200);
                                })
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
            position: relative;
            @include fontStyle;
            text {
                margin-left: 10rpx;
                @include fontStyle(#999, 24rpx);
            }
            button {
                position: absolute;
                top: -5rpx;
                right: 0;
                height: 50rpx;
                padding: 0 20rpx;
                border-radius: 50rpx;
                border: 1px solid $color;
                @include fontStyle($color, 24rpx, calc(50rpx - 2px));
                &.active {
                    color: #fff;
                    background: $color;
                }
            }
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
            }
            .upload-button {
                button {
                    background: #fff;
                }
            }
        }
        .form-video {
            .list {
                .item {
                    position: relative;
                    padding-top: 56.25%;
                    background: #fff;
                    &:nth-child(n+2) {
                        margin-top: 20rpx;
                    }
                    .video {
                        @include positionCenter;
                    }
                    .video-delete {
                        z-index: 5;
                        position: absolute;
                        right: 20rpx;
                        top: 20rpx;
                        width: 56rpx;
                        height: 56rpx;
                        background: red;
                        border-radius: 50%;
                        @include fontStyle(#fff, 22rpx, 56rpx);
                    }
                    .video-reload {
                        position: absolute;
                        z-index: 5;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        margin: auto;
                        height: 60rpx;
                        background: red;
                        font-weight: bold;
                        @include fontStyle(#fff, 24rpx, 60rpx);
                    }
                }
            }
            .upload-button {
                button {
                    background: #fff;
                }
            }
        }
        .form-editor {
            margin-top: 30rpx;
            .editor-container {
                padding: 25rpx 30rpx;
                background: #fff;
                .editor {
                    @include fontStyle;
                    &::before {
                        content: attr(data-placeholder);
                        position: absolute;
                        font-style: normal;
                        left: 0;
                        top: 0;
                        @include fontStyle(#ccc);
                    }
                }
            }
        }
        .rule-container {
            margin-top: 30rpx;
            .rule-title {
                position: relative;
                text-align: center;
                background: #fff;
                font-weight: bold;
                @include fontStyle($color, 28rpx, 80rpx);
                &::before,
                &::after {
                    content: '';
                    position: absolute;
                    z-index: 5;
                    bottom: -20rpx;
                    width: 40rpx;
                    height: 40rpx;
                    border-radius: 50%;
                    background: $backgroundColor;
                }
                &::before {
                    left: -20rpx;
                }
                &::after {
                    right: -20rpx;
                }
            }
            .rule-content {
                border-top: 1px solid #eee;
                padding: 25rpx $space 30rpx;
                background: #fff;
                @include parseContent;
            }
        }
    }
</style>