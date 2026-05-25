export const tinymceLanguage = 'zh_CN'
export const tinymceLanguageUrl = `${import.meta.env.BASE_URL}tinymce/langs/zh_CN.js`
export const tinymceLicenseKey = 'gpl'

export const tinymcePlugins = [
  'advlist',
  'anchor',
  'autolink',
  'autosave',
  'charmap',
  'code',
  'codesample',
  'directionality',
  'emoticons',
  'fullscreen',
  'image',
  'importcss',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'nonbreaking',
  'pagebreak',
  'preview',
  'save',
  'searchreplace',
  'table',
  'visualblocks',
  'visualchars',
  'wordcount'
]

export const tinymceToolbar = [
  'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent blockquote undo redo removeformat subscript superscript code codesample',
  'bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
]

export function createTinymceInit(options = {}) {
  return {
    language: tinymceLanguage,
    language_url: tinymceLanguageUrl,
    license_key: tinymceLicenseKey,
    height: 500,
    convert_urls: false,
    promotion: false,
    branding: false,
    plugins: tinymcePlugins.join(' '),
    toolbar: tinymceToolbar,
    ...options
  }
}

export function createTinymceImageUploadHandler(upload, resolveUrl) {
  return blobInfo => {
    const formData = new FormData()
    formData.append('file', blobInfo.blob())

    return upload(formData).then(res => {
      const url = resolveUrl(res)

      if (!url) {
        return Promise.reject('上传失败，请重新上传')
      }

      return url
    }).catch(() => Promise.reject('上传失败，请重新上传'))
  }
}
