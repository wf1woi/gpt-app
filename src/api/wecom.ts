/**
 * 获取企业微信用户信息API
 */

/**
 * 获取用户工号接口
 * @param code - 企业微信授权code
 * @returns Promise<{ success: boolean; data?: string; error?: string }>
 */
export async function getUserByCode(code: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://wc-api-ts.xgd.com/api/wecom/ai/user?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.code === 200) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.msg || 'Failed to get user info',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}