import Image from 'next/image'

export default function Page() {
  return (
    <div className="py-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold">关于本项目</h2>
        <p className="text-white text-opacity-70">
          持续开发中！！！ 项目灵感来源于 GitHub 的
          <a href="https://skyline.github.com"> Skyline</a>
          (现在已经下线)，今年算是真正入坑骑行的第二年，看到GitHub
          Sykline的时候突发奇想：能不能做一个类似的项目，根据 Strava
          的运动数据生成一个3D的日历图，展示这一年的骑行数据，同时也能在地图上看到自己在中国哪些城市骑行过。项目还有很多需要完善的地方，不过我会持续更新。
        </p>
      </div>
      <div>
        <h2 className="text-lg font-bold">使用问题</h2>
        <p className="text-white text-opacity-70">
          如果在使用过程中遇到问题或者有更好的想法，欢迎添加我的微信（void_undefined）与我联系😄
        </p>
      </div>
    </div>
  )
}
