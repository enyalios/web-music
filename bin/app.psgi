#!/usr/bin/perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";


# use this block if you don't need middleware, and only have a single target Dancer app to run here
use music;

music->to_app;

=begin comment
# use this block if you want to include middleware such as Plack::Middleware::Deflater

use music;
use Plack::Builder;

builder {
    enable 'Deflater';
    music->to_app;
}

=end comment

=cut

=begin comment
# use this block if you want to mount several applications on different path

use music;
use music_admin;

use Plack::Builder;

builder {
    mount '/'      => music->to_app;
    mount '/admin'      => music_admin->to_app;
}

=end comment

=cut

