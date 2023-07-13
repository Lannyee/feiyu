<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="敏感词检测" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="sensitive-container">
            <view class="sensitive-form">
                <view class="form-editor">
                    <editor id="editor" class="editor" @input="editorInput" :data-placeholder="editorPlaceholder"></editor>
                </view>

                <view class="form-button flex flex-row-end">
                    <button @tap="emptyEditor">清空</button>
                    <button @tap="pasteEditor">粘贴</button>
                </view>
            </view>

            <view class="sensitive-form" v-show="isShowResultEditor">
                <view class="form-editor">
                    <editor id="resultEditor" class="editor" read-only @input="resultEditorInput"></editor>
                </view>
            </view>

            <button class="page-button" @tap="$u.throttle(checkWord, 500)">立即检测</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            editorPlaceholder: '请输入想要检测的内容',
            sensitiveHtml: '',
            sensitiveText: '',
            resultEditor: '',
            isShowResultEditor: false
        }),
        methods: {
            editorInput(e) {
                this.sensitiveHtml = e.detail.html;
                this.sensitiveText = e.detail.text;
                if (this.$common.isEmpty(e.detail.text) || e.detail.text == '\n') {
                    this.sensitiveText = '';
                    this.editorPlaceholder = '请输入想要检测的内容';
                    this.isShowResultEditor = false;
                } else {
                    this.editorPlaceholder = '';
                }
            },
            resultEditorInput(e) {
                this.resultEditor = e.detail.text;
                if (this.$common.isEmpty(e.detail.text) || e.detail.text == '\n') {
                    this.resultEditor = '';
                    this.isShowResultEditor = false;
                }
            },
            emptyEditor() {
                this.isShowResultEditor = false;
                uni.createSelectorQuery().select('#editor').context(res => {
                    this.editorPlaceholder = '请输入想要检测的内容';
                    this.sensitiveHtml = '';
                    this.sensitiveText = '';
                    this.editorCtx = res.context;
                    this.editorCtx.setContents({
                        html: ''
                    })
                }).exec();
            },
            copyEditor() {
                uni.setClipboardData({
                    data: this.resultEditor,
                    success: () => {
                        uni.showToast({
                            title: '复制成功'
                        })
                    }
                });
            },
            pasteEditor() {
                uni.getClipboardData({
                    success: res => {
                        if (this.$common.isNotEmpty(res.data)) {
                            let value = res.data;
                            uni.createSelectorQuery().select('#editor').context(res => {
                                this.editorPlaceholder = '';
                                this.sensitiveHtml = value;
                                this.sensitiveText = value;
                                this.editorCtx = res.context;
                                this.editorCtx.setContents({
                                    html: value
                                })
                            }).exec();
                        }
                    }
                });
            },
            checkWord() {
                this.sensitiveText = this.sensitiveText.replace(/(^\s*)|(\s*$)/g, '');
                if (!this.sensitiveText) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入想要检测的内容'
                    })
                    return false;
                }

                this.$u.post('/getCheckedWords', {
                    word: this.sensitiveText
                }).then(res => {
                    uni.showToast({
                        title: '检测成功'
                    });
                    this.isShowResultEditor = true;
                    this.resultEditor = this.sensitiveText;
                    if (this.$common.isNotEmpty(res.data.words)) {
                        for (let item of res.data.words) {
                            let reg = new RegExp(item.words, 'g');
                            this.sensitiveHtml = this.sensitiveHtml.replace(reg, `<span style="background-color: red; color: #fff;">${item.words}</span>`);
                        }
                    }
                    uni.createSelectorQuery().select('#resultEditor').context(res => {
                        this.editorCtx = res.context;
                        this.editorCtx.setContents({
                            html: this.sensitiveHtml
                        })
                    }).exec();
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .sensitive-container {
        padding: 30rpx $space 0;
        .sensitive-form {
            &:nth-child(n+2) {
                margin-top: 50rpx;
            }
            .form-editor {
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
            .form-button {
                margin-top: 25rpx;
                button {
                    width: 160rpx;
                    height: 60rpx;
                    border-radius: 60rpx;
                    background: $gradientColor;
                    @include fontStyle(#fff, 28rpx, 60rpx);
                    &:nth-child(n+2) {
                        margin-left: 25rpx;
                    }
                }
            }
        }
    }
</style>