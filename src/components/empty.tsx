interface EmptyProps {}
import Image from 'next/image'

export const Empty: React.FC<EmptyProps> = () => {
  return (
    <div className="py-40">
      <Image
        className="mx-auto"
        src="/empty.png"
        width={400}
        height={215}
        alt="empty"
      />
      <div className="text-center text-xl text-[#999] font-bold">
        没有数据哦
      </div>
    </div>
  )
}
