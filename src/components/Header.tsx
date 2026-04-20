const Header = () => {

    const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <header className="max-w-6xl mx-auto border-b-4 border-black pb-4 mb-2">
        <div className="flex justify-between items-end border-b border-gray-400 pb-1 text-sm uppercase tracking-widest">
          <span>Vol. I ... No. 01</span>
          <span className="hidden md:block">Hong Kong, {today}</span>
          <span>One Dollar</span>
        </div>
        <h1 className="text-center text-4xl md:text-6xl font-black tracking-tighter py-6 italic border-b border-gray-400">
          A Software Engineer
        </h1>
        <div className="text-center py-2 text-sm italic font-sans border-b-4 border-black">
          "Also a beginner in pixel art."
        </div>
      </header>
    )
}

export default Header