<template>
  <div
    class="bg-white p-2 dark:bg-surface-sunken shadow-2xl border-t dark:border-black/30 w-full"
  >
    <textarea
      class="appearance-none outline-hidden  ring-0 border-none resize-none text-slate-600 py-1  w-full bg-white dark:bg-surface-sunken"
      placeholder="Your message..."
      aria-label="Chat message"
    ></textarea>
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-between">
        <div>
          <svg
            width="24"
            height="24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            _ngcontent-age-c164=""
            aria-hidden="true"
          >
            <path
              d="M12 2c5.5228 0 10 4.4771 10 10 0 5.5228-4.4772 10-10 10-5.5229 0-10-4.4772-10-10C2 6.4771 6.4771 2 12 2Zm4.0986 11.125c-.3829-.2552-.901-.1514-1.1562.2314-1.442 2.1622-4.2172 2.2298-5.7422.2022l-.1436-.2022-.0507-.0683a.8331.8331 0 0 0-1.1045-.1631.834.834 0 0 0-.2754 1.082l.044.0733.208.2929c2.2107 2.9261 6.3702 2.8281 8.4511-.2929.2551-.3829.1522-.9-.2305-1.1553ZM9.2725 8.3633c-.5019.0001-.909.4073-.9092.9092a.9092.9092 0 1 0 .9092-.9092Zm5.455 0a.9092.9092 0 1 0 .9092.9092c-.0001-.502-.4073-.909-.9092-.9092Z"
              fill="#8F8F8F"
              _ngcontent-age-c164=""
            ></path>
          </svg>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            _ngcontent-age-c164=""
            aria-hidden="true"
          >
            <path
              d="M5.9115 15.0574c-2.48 0-3.9115-1.5896-3.9115-3.562 0-1.756 1.1485-3.0626 2.6548-3.5037.2747-3.0876 2.8546-5.5427 5.9838-5.5427 2.4052 0 4.336 1.3232 5.3763 3.3789 2.8213 0 4.9851 1.939 4.9851 4.5939 0 2.5633-2.0307 4.6356-4.7604 4.6356H5.9116Zm6.841 3.8865c-.1415.2414-.4411.3329-.6907.1915-.258-.1499-.3246-.4411-.1831-.6742l1.0902-1.8975c.1498-.258.4328-.3329.6824-.1914.2497.1498.3329.4411.1831.6908l-1.0819 1.8808Zm-6.6246.0084c-.1415.2413-.441.3329-.6824.1914-.258-.1498-.333-.4411-.1914-.6741l1.0902-1.8975c.1581-.258.441-.3329.6907-.1915.2497.1498.333.4411.1748.6908L6.128 18.9523Zm9.2295 2.3302c-.1415.2497-.4411.3329-.6907.1914-.258-.1414-.3246-.4327-.1914-.6741l1.0985-1.8892c.1498-.2579.4328-.3412.6824-.1914.2497.1415.3329.4328.1831.6908l-1.0819 1.8725Zm-6.6246.0083c-.1415.2497-.441.3329-.6907.1915-.2497-.1415-.3246-.4328-.1831-.6741l1.0902-1.8892c.1498-.258.4328-.3412.6908-.1914.2496.1414.3245.4327.1747.6907l-1.0819 1.8725Z"
              fill="#8F8F8F"
              _ngcontent-age-c164=""
            ></path>
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <svg
          width="17"
          height="11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          _ngcontent-age-c164=""
          aria-hidden="true"
        >
          <path
            d="M1.4134 10.5H.2486l2.6172-7.2727h1.2677L6.7507 10.5H5.586L3.53 4.5483H3.473L1.4134 10.5Zm.1953-2.848H5.387v.9233H1.6087V7.652Zm7.372 2.848H7.35L11.014.3182h1.7749L16.4529 10.5h-1.6306l-2.8786-8.3324h-.0795L8.9807 10.5Zm.2734-3.9872h5.2898v1.2926H9.2541V6.5128Z"
            fill="#8F8F8F"
            _ngcontent-age-c164=""
          ></path>
        </svg>
        <span class="text-stone-500">160</span>
      </div>
      <button class="text-brand-mid" aria-label="Send message">
        <Icon name="tabler:send" class="w-[24px] h-[24px] text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
