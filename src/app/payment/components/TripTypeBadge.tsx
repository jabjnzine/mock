"use client";

const JoinInTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M7.63411 9.05866C7.55078 9.05033 7.45078 9.05033 7.35911 9.05866C5.37578 8.99199 3.80078 7.36699 3.80078 5.36699C3.80078 3.32533 5.45078 1.66699 7.50078 1.66699C9.54245 1.66699 11.2008 3.32533 11.2008 5.36699C11.1924 7.36699 9.61745 8.99199 7.63411 9.05866Z" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.6747 3.33301C15.2914 3.33301 16.5914 4.64134 16.5914 6.24967C16.5914 7.82467 15.3414 9.10801 13.7831 9.16634C13.7164 9.15801 13.6414 9.15801 13.5664 9.16634" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.46563 12.133C1.44896 13.483 1.44896 15.683 3.46563 17.0247C5.75729 18.558 9.51563 18.558 11.8073 17.0247C13.824 15.6747 13.824 13.4747 11.8073 12.133C9.52396 10.608 5.76562 10.608 3.46563 12.133Z" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.2852 16.667C15.8852 16.542 16.4518 16.3003 16.9185 15.942C18.2185 14.967 18.2185 13.3587 16.9185 12.3837C16.4602 12.0337 15.9018 11.8003 15.3102 11.667" stroke="#265ED6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrivateTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12.1586 10.87C12.0586 10.86 11.9386 10.86 11.8286 10.87C9.44859 10.79 7.55859 8.84 7.55859 6.44C7.55859 3.99 9.53859 2 11.9986 2C14.4486 2 16.4386 3.99 16.4386 6.44C16.4286 8.84 14.5386 10.79 12.1586 10.87Z" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.0008 21.8097C10.1808 21.8097 8.37078 21.3497 6.99078 20.4297C4.57078 18.8097 4.57078 16.1697 6.99078 14.5597C9.74078 12.7197 14.2508 12.7197 17.0008 14.5597" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TripTypeBadge({ tripType }: { tripType: string }) {
  if (/private/i.test(tripType)) {
    return (
      <div className="px-2 py-1 rounded-[30px] inline-flex items-center justify-center gap-1 bg-[#FFFBEB] border border-[#FFC107]">
        <PrivateTypeIcon />
        <span className="text-center text-sm font-normal text-[#FFC107] font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
          Private
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#F8FCFF] rounded-[30px] border border-[#265ED6]">
      <JoinInTypeIcon />
      <span className="w-12 text-center text-[#265ED6] text-sm font-normal font-['IBM_Plex_Sans_Thai'] leading-[18px] tracking-tight">
        Join In
      </span>
    </div>
  );
}
