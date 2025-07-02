export const NOTION_CONFIG = {
  apiKey: import.meta.env.VITE_NOTION_API_KEY,
  databaseId: import.meta.env.VITE_NOTION_DATABASE_ID,
  baseUrl: 'https://api.notion.com/v1'
}

export const createNotionPage = async (title, content, metadata = {}) => {
  try {
    const response = await fetch(`${NOTION_CONFIG.baseUrl}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: {
          database_id: NOTION_CONFIG.databaseId
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          },
          Status: {
            select: {
              name: 'Draft'
            }
          },
          'Source Transcript': {
            rich_text: [
              {
                text: {
                  content: metadata.transcriptSource || 'Unknown'
                }
              }
            ]
          },
          'Date Generated': {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content
                  }
                }
              ]
            }
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Notion page:', error)
    throw error
  }
}