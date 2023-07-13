<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="新手指南" title-size="32" title-color="#333" z-index="99999"></u-navbar>

        <view class="guide-container">
            <view class="list">
                <view class="item" v-for="(item, index) in step" :key="index" v-show="item.isShow"><image :src="item.url"></image></view>
            </view>
            <view class="button-group flex flex-column-center flex-row-between">
                <button class="button-left" v-if="index != 2" @tap="toHome"></button>
                <button class="button-right" v-if="index != 2" @tap="nextStep"></button>
                <button class="button-center" v-if="index == 2" @tap="toHome"></button>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            index: 0,
            step: [
                {
                    url: 'https://feiyudata.com/profile/wechat/images/zy1.png',
                    isShow: true
                },
                {
                    url: 'https://feiyudata.com/profile/wechat/images/zy2.png',
                    isShow: false
                },
                {
                    url: 'https://feiyudata.com/profile/wechat/images/zy3.png',
                    isShow: false
                }
            ]
        }),
        methods: {
            nextStep() {
                this.step[this.index].isShow = false;
                this.index++;
                this.step[this.index].isShow = true;
            },
            toHome() {
                this.$u.post('/updateGuideStatus').then(res => {
                    this.$u.route({
                        type: 'tab',
                        url: '/pages/home/home'
                    })
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .guide-container {
        .list {
            .item {
                image {
                    width: 100%;
                    height: 100vh;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    margin: auto;
                }
            }
        }
        .button-group {
            width: 100%;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            button {
                width: 50%;
                height: 300rpx;
                opacity: 0;
            }
            .button-center {
                width: 100%;
            }
        }
    }
</style>