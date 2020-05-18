{% if not (theme.duoshuo and theme.duoshuo.shortname) and not theme.duoshuo_shortname %}
  {% if theme.gitalk.enable %}
    {% if page.comments %}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1.2.2/dist/gitalk.css">
      <script src="https://cdn.jsdelivr.net/npm/gitalk@1.2.2/dist/gitalk.min.js"></script>
      <script type="text/javascript">
        const gitalk = new Gitalk({
          clientID: '{{theme.gitalk.clientID}}',
          clientSecret: '{{theme.gitalk.clientSecret}}',
          repo: '{{theme.gitalk.repo}}',
          owner: '{{theme.gitalk.owner}}',
          admin: '{{theme.gitalk.admin}}'.split(','),
          pagerDirection: '{{theme.gitalk.pagerDirection}}',
          id: location.pathname,      // Ensure uniqueness and length less than 50
          distractionFreeMode: false   // facebook-like distraction free mode
        })
        gitalk.render('gitalk-container')
      </script>
    {% endif %}
  {% endif %}
{% endif %}