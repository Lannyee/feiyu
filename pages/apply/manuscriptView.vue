<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="初稿信息" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="manuscript-container">
            <view class="manuscript-picture" v-if="manuscriptType == '1'">
                <view class="list flex flex-wrap">
                    <view class="item upload-picture" v-for="(item, index) in manuscriptPicture" :key="index">
                        <u-image @tap="$common.previewImage(manuscriptPicture, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                    </view>
                </view>
            </view>
            <view class="manuscript-video" v-else-if="manuscriptType == '2'">
                <view class="list">
                    <view class="item" v-for="(item, index) in manuscriptPicture" :key="index">
                        <video class="video" :src="item.url"></video>
                    </view>
                </view>
            </view>
            <view class="manuscript-content" v-if="manuscript.content">
                <u-parse :html="manuscript.content"></u-parse>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            applyId: '',
            manuscriptType: '',
            manuscript: {},
            manuscriptPicture: [],
        }),
        onLoad(data) {
            this.applyId = data.applyId;
            this.manuscriptType = data.manuscriptType;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestManuscript(this.applyId);
				}
			}, true);
        },
        methods: {
            requestManuscript(applyId) {
                this.$u.post('/checkManuscript', {
                    applyId
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.manuscript = res.data;
                        this.manuscriptPicture = this.$common.pictureToArray(this.manuscript.mediaPath);
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .manuscript-container {
        padding: 30rpx $space 50rpx;
        .manuscript-picture {
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
        .manuscript-video {
            .item {
                position: relative;
                padding-top: 56.25%;
                background: #fff;
                &:nth-child(n+2) {
                    margin-top: 15rpx;
                }
                .video {
                    @include positionCenter;
                }
            }
        }
        .manuscript-content {
            margin-top: 30rpx;
            background: #fff;
            padding: 25rpx $space;
            @include parseContent;
        }
    }
</style>