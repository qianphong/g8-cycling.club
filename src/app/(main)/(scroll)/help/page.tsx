export default function Page() {
  return (
    <div className="py-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold">关于本项目</h2>
        <p className="text-white text-opacity-70">
          <b>[WIP]持续开发中！！！</b>
          灵感来源于 GitHub 的<a href="https://skyline.github.com"> Skyline</a>
          (现在已经下线)，参考 GitHub Skyline 做一个类似的玩具，可以根据 Strava
          的运动数据生成 3D
          图，更直观的展示你这一年每天的骑行里程，也支持在地图上查看自己在哪些城市骑行过。
        </p>
      </div>
      <div>
        <h2 className="text-lg font-bold">使用问题</h2>
        <p className="text-white text-opacity-70">
          如果在使用过程中遇到问题或者有更好的想法，欢迎添加我的微信
          <i className="text-primary">void_undefined</i>与我联系😄
        </p>
      </div>
    </div>
  )
}
