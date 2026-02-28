export default function Page({ children }) {
  return (
    <div
      className="flex-1 flex flex-col w-full max-w-lg mx-auto"
      style={{ animation: 'pageEnter 0.3s ease-out' }}
    >
      {children}
    </div>
  )
}
