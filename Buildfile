# ==========================================================================
# SCUI JavaScript Framework - Buildfile
# copyright (c) 2009 - Evin Grano, and contributors
# ==========================================================================

# This buildfile defines the configurations needed to link together the 
# various frameworks that make up CoreUI.  If you want to override some
# of these settings, you should make changes to your project Buildfile 
# instead.

config :all, 
  :layout         => 'scui:lib/index.rhtml',
  :test_layout    => 'scui:lib/test.rhtml',
  :test_required  => ['sproutcore'],
  :debug_required => ['sproutcore']

# in debug mode, combine the JS for SC by default.  This will improve perf
# while working with apps.  If you are hacking SC itself, you can turn this
# off in your project buildfile by referencing sproutcore specifically
mode :debug do
  config :all, 
    :combine_javascript => true,
    :combine_stylesheet => true
end
  
# CORE FRAMEWORKS
config :foundation, :required => [:sproutcore]
config :calendar, :required => [:foundation]
config :dashboard, :required => [:foundation]
config :drawing, :required => [:foundation]
config :linkit, :required => [:foundation, :drawing]
config :sai, :required => [:foundation]

# WRAPPER FRAMEWORKS
config :scui, :required => [:foundation, :calendar, :dashboard, :drawing, :linkit]

# SPECIAL THEMES
# These do not require any of the built-in SproutCore frameworks
%w(standard_theme empty_theme).each do |target_name|
  config target_name, 
    :required => [], :test_required => [], :debug_required => []
end

# CONFIGURE THEMES
config :empty_theme, 
  :theme_name => 'empty-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

config :standard_theme, 
  :required => :empty_theme, 
  :theme_name => 'sc-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']
#   
