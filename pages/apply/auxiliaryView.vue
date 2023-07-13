<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="辅助说明" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="auxiliary-container">
            <view class="list">
                <view class="item" v-for="(item, index) in auxiliaryPicture" :key="index">
                    <u-image :src="item.url" width="100%" mode="widthFix"></u-image>
                </view>
            </view>
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
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .auxiliary-container {
        padding: 30rpx $space 50rpx;
        .item {
            &:nth-child(n+2) {
                margin-top: 20rpx;
            }
        }
    }
</style>