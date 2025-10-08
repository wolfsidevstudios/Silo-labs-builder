export function deleteAllData(): void {
  const keysToRemove = [
    'gemini_api_key', 'gemini_model', 'ai_provider', 'experimental_live_preview',
    'github_personal_access_token', 'netlify_personal_access_token', 'giphy_api_key', 'unsplash_access_key', 'openai_api_key', 'pexels_api_key', 'freesound_api_key', 'spotify_client_id', 'spotify_client_secret', 'stability_api_key', 'streamline_api_key', 'weatherapi_api_key', 'openweathermap_api_key', 'tmdb_api_key', 'youtube_api_key', 'mapbox_api_key', 'exchangerate_api_key', 'fmp_api_key', 'newsapi_api_key', 'rawg_api_key', 'wordsapi_api_key',
    'huggingface_access_token', 'huggingface_model_url',
    'ai_react_app_builder_projects', 'ai_app_builder_images', 'ai_react_app_builder_secrets',
    'ui_theme_template',
    'onboardingCompleted', 'userName', 'businessProfile',
    'featureDrop_oct2025_v3_seen', 'referralSeen',
    'isPro', 'proTrialEndTime', 'proTrialFreeWeekGranted',
    'user_affiliate_id', 'affiliate_stats'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Reload to reflect changes immediately
  window.location.reload();
}
